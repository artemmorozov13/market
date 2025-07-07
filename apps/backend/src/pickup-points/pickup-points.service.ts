import { PickupWorkingHoursService } from '@app/pickup-working-hours/pickup-working-hours.service';
import { StoreService } from '@app/store/store.service';
import { PickupPointEntity } from '@core/entities/pickup-point.entity';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { PickupWorkingHoursEntity } from '@core/entities/pickup-working-hours.entity';

@Injectable()
export class PickupPointService {
  constructor(
    @InjectRepository(PickupPointEntity)
    private readonly pickupPointRepository: Repository<PickupPointEntity>,
    private readonly workingHoursService: PickupWorkingHoursService,
    private readonly storeService: StoreService,
  ) {}

  async create(userJwt: AuthJwtPayload, createDto: CreatePickupPointDto): Promise<PickupPointEntity> {
    await this.storeService.getStoreDataById(userJwt.storeId);

    // Валидация рабочих часов
    if (createDto.workingHours?.some(wh => 
      !wh.dayOfWeek || !wh.openingTime || !wh.closingTime
    )) {
      throw new BadRequestException('All working hours fields are required');
    }

    return this.pickupPointRepository.manager.transaction(async (transactionalEntityManager) => {
      try {
        // 1. Создаем пункт выдачи
        const pickupPoint = this.pickupPointRepository.create({
          name: createDto.name,
          fullAddress: createDto.fullAddress,
          postal_code: createDto.postal_code,
          fias_id: createDto.fias_id,
          geo_lat: createDto.geo_lat,
          geo_lon: createDto.geo_lon,
          store: { id: userJwt.storeId },
        });

        const savedPoint = await transactionalEntityManager.save(pickupPoint);

        // 2. Создаем рабочие часы, если они переданы
        if (createDto.workingHours?.length > 0) {
          const workingHoursToCreate = createDto.workingHours.map(wh => ({
            dayOfWeek: wh.dayOfWeek,
            openingTime: wh.openingTime,
            closingTime: wh.closingTime,
            pickupPoint: { id: savedPoint.id },
          }));

          await transactionalEntityManager.save(
            PickupWorkingHoursEntity,
            workingHoursToCreate
          );
        }

        // 3. Возвращаем полные данные с рабочими часами
        return transactionalEntityManager.findOne(PickupPointEntity, {
          where: { id: savedPoint.id },
          relations: ['workingHours', 'store'],
        });

      } catch (error) {
        if (error.code === '23505') {
          throw new ConflictException('Pickup point with this name already exists');
        }
        throw error;
      }
    });
  }

  // Остальные методы остаются без изменений
  async findAll(userJwt: AuthJwtPayload): Promise<PickupPointEntity[]> {
    return this.pickupPointRepository.find({
      relations: ['store', 'workingHours'],
      where: {
        status: 'active',
        store: {
          id: userJwt.storeId
        }
      },
    });
  }

  async findOne(id: number): Promise<PickupPointEntity> {
    const pickupPoint = await this.pickupPointRepository.findOne({
      where: { id },
      relations: ['store', 'workingHours'],
    });

    if (!pickupPoint) {
      throw new NotFoundException(`Pickup point with ID ${id} not found`);
    }

    return pickupPoint;
  }

  async findByStore(storeId: number): Promise<PickupPointEntity[]> {
    return this.pickupPointRepository.find({
      where: { store: { id: storeId }, status: 'active' },
      relations: ['workingHours'],
    });
  }

  async update(
    user: AuthJwtPayload,
    id: number,
    updateDto: UpdatePickupPointDto,
  ): Promise<PickupPointEntity> {
    const pickupPoint = await this.findOne(id);

    const fieldsToUpdate = [
      'name',
      'fullAddress',
      'postal_code',
      'fias_id',
      'geo_lat',
      'geo_lon',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (updateDto[field] !== undefined) {
        pickupPoint[field] = updateDto[field];
      }
    });

    if (updateDto.workingHours !== undefined) {
      if (updateDto.workingHours.some(wh => 
        !wh.dayOfWeek || !wh.openingTime || !wh.closingTime
      )) {
        throw new BadRequestException('All working hours fields (dayOfWeek, openingTime, closingTime) are required');
      }

      const updatedWorkingHours = await this.workingHoursService.updateMany(
        id,
        updateDto.workingHours
      );
      
      pickupPoint.workingHours = updatedWorkingHours;
    }

    return this.pickupPointRepository.save(pickupPoint);
  }

  async remove(id: number): Promise<void> {
    const pickupPoint = await this.findOne(id);
    pickupPoint.status = 'deleted';
    await this.pickupPointRepository.save(pickupPoint);
  }

  async hardRemove(id: number): Promise<void> {
    const pickupPoint = await this.findOne(id);
    await this.pickupPointRepository.remove(pickupPoint);
  }

  async findByCoordinates(
    lat: number,
    lon: number,
    radiusKm: number = 10,
  ): Promise<PickupPointEntity[]> {
    return this.pickupPointRepository
      .createQueryBuilder('point')
      .where(
        `ST_Distance(
          ST_MakePoint(:lon, :lat)::geography,
          ST_MakePoint(CAST(point.geo_lon AS float), CAST(point.geo_lat AS float))::geography
        ) <= :radius * 1000`,
        { lat, lon, radius: radiusKm },
      )
      .andWhere('point.status = :status', { status: 'active' })
      .getMany();
  }
}