import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { PickupPoint } from '@core/entities/pickup-point.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { PickupPointStoreResolver } from './lib/pickup-point-store-resolver';
import { DeliveryTimesService } from '../delivery-times/delivery-times.service';
import { FindPickupPointDto } from './dto/find-pickup-point-body';
import { StoreService } from '@app/store/store.service';

@Injectable()
export class PickupPointService {
  constructor(
    @InjectRepository(PickupPoint)
    private pickupPointRepository: Repository<PickupPoint>,
    private readonly pickupPointResolver: PickupPointStoreResolver,
    private readonly deliveryTimesService: DeliveryTimesService,
    private readonly storeService: StoreService
  ) {}

  async create(userJwt: AuthJwtPayload, createDto: CreatePickupPointDto): Promise<PickupPoint> {
    const pickupPoint = this.pickupPointRepository.create({
      name: createDto.name,
      radius: createDto.radius,
      postal_code: createDto.address?.postal_code,
      fias_id: createDto.address?.fias_id,
      geo_lat: createDto.address?.geo_lat,
      geo_lon: createDto.address?.geo_lon,
      fullAddress: createDto.address.fullAddress,
      status: 'active',
      store: {
        id: userJwt.storeId
      },
    })

    const savedPoint = await this.pickupPointRepository.save(pickupPoint);

    if (createDto.deliveryTimes && createDto.deliveryTimes.length > 0) {
      savedPoint.deliveryTimes = await this.deliveryTimesService.createDeliveryTimes(
        savedPoint.id,
        createDto.deliveryTimes
      );
    }

    return savedPoint;
  }

  async findAll(userJwt: AuthJwtPayload, body: FindPickupPointDto): Promise<PickupPoint[]> {
    return this.pickupPointRepository.find({
      order: {
        createdAt: "ASC"
      },
      where: {
        status: "active",
        store: {
          id: body.storeId || userJwt.storeId
        }
      },
      relations: ['deliveryTimes']
    });
  }

  async findOne(userJwt: AuthJwtPayload, id: number): Promise<PickupPoint> {
    const point = await this.pickupPointRepository.findOne({
      where: {
        id,
        store: {
          id: userJwt.storeId
        }
      },
      relations: ['deliveryTimes'],
    });

    if (!point) {
      throw new NotFoundException(`Pickup point with ID ${id} not found`);
    }

    return point;
  }

  async update(userJwt: AuthJwtPayload, id: number, updateDto: UpdatePickupPointDto): Promise<PickupPoint> {
    const point = await this.findOne(userJwt, id);

    if (updateDto.name) point.name = updateDto.name;
    if (updateDto.radius) point.radius = updateDto.radius;
    if (updateDto.address) {
      if (updateDto.address.postal_code) point.postal_code = updateDto.address.postal_code;
      if (updateDto.address.fias_id) point.fias_id = updateDto.address.fias_id;
      if (updateDto.address.geo_lat) point.geo_lat = updateDto.address.geo_lat;
      if (updateDto.address.geo_lon) point.geo_lon = updateDto.address.geo_lon;
      if (updateDto.address.fullAddress) point.fullAddress = updateDto.address.fullAddress;
    }
    if (updateDto.status) point.status = updateDto.status;

    if (updateDto.deliveryTimes) {
      point.deliveryTimes = await this.deliveryTimesService.updateDeliveryTimes(
        point.id,
        updateDto.deliveryTimes
      );
    }

    return this.pickupPointRepository.save(point);
  }

  async remove(userJwt: AuthJwtPayload, id: number): Promise<void> {
    const point = await this.pickupPointRepository.findOne({
      where: {
        id,
        store: {
          id: userJwt.storeId
        }
      }
    });
    
    if (!point) {
      throw new NotFoundException('Pickup point not found');
    }
  
    await this.pickupPointRepository.update(id, {
      status: 'deleted'
    });
  }
}