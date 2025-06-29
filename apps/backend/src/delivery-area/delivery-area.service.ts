import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { UpdateDeliveryAreaDto } from './dto/update-delivery-area.dto';
import { DeliveryArea } from '@core/entities/delivery-area.entity';
import { AuthJwtPayload } from '@core/types/user-type';
import { DeliveryTimesService } from '../delivery-times/delivery-times.service';
import { FindDeliveryAreaDto } from './dto/find-delivery-area-body';
import { StoreService } from '@app/store/store.service';

@Injectable()
export class DeliveryAreaService {
  constructor(
    @InjectRepository(DeliveryArea)
    private deliveryAreaRepository: Repository<DeliveryArea>,
    private readonly deliveryTimesService: DeliveryTimesService,
    private readonly storeService: StoreService
  ) {}

  async create(userJwt: AuthJwtPayload, createDto: CreateDeliveryAreaDto): Promise<DeliveryArea> {
    const deliveryArea = this.deliveryAreaRepository.create({
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

    const savedPoint = await this.deliveryAreaRepository.save(deliveryArea);

    if (createDto.deliveryTimes && createDto.deliveryTimes.length > 0) {
      savedPoint.deliveryTimes = await this.deliveryTimesService.createDeliveryTimes(
        savedPoint.id,
        createDto.deliveryTimes
      );
    }

    return savedPoint;
  }

  async findAll(userJwt: AuthJwtPayload, body: FindDeliveryAreaDto): Promise<DeliveryArea[]> {
    return this.deliveryAreaRepository.find({
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

  async findOne(userJwt: AuthJwtPayload, id: number): Promise<DeliveryArea> {
    const point = await this.deliveryAreaRepository.findOne({
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

  async update(userJwt: AuthJwtPayload, id: number, updateDto: UpdateDeliveryAreaDto): Promise<DeliveryArea> {
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

    return this.deliveryAreaRepository.save(point);
  }

  async remove(userJwt: AuthJwtPayload, id: number): Promise<void> {
    const point = await this.deliveryAreaRepository.findOne({
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
  
    await this.deliveryAreaRepository.update(id, {
      status: 'deleted'
    });
  }
}