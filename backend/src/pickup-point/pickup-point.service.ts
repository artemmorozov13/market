import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { PickupPoint } from '../entities/pickup-point.entity';
import { DeliveryTime } from '../entities/delivery-time.entity';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';

@Injectable()
export class PickupPointService {
  constructor(
    @InjectRepository(PickupPoint)
    private pickupPointRepository: Repository<PickupPoint>,
    @InjectRepository(DeliveryTime)
    private deliveryTimeRepository: Repository<DeliveryTime>,
  ) {}

  async create(createDto: CreatePickupPointDto): Promise<PickupPoint> {
    const pickupPoint = this.pickupPointRepository.create({
      name: createDto.name,
      radius: createDto.radius,
      postal_code: createDto.address?.postal_code,
      fias_id: createDto.address?.fias_id,
      geo_lat: createDto.address?.geo_lat,
      geo_lon: createDto.address?.geo_lon,
      fullAddress: createDto.address.fullAddress,
      status: 'active',
    });

    const savedPoint = await this.pickupPointRepository.save(pickupPoint);

    if (createDto.deliveryTimes && createDto.deliveryTimes.length > 0) {
      const deliveryTimes = createDto.deliveryTimes.map(timeDto =>
        this.deliveryTimeRepository.create({
          ...timeDto,
          pickupPoint: savedPoint,
        })
      );
      savedPoint.deliveryTimes = await this.deliveryTimeRepository.save(deliveryTimes);
    }

    return savedPoint;
  }

  async findAll(): Promise<PickupPoint[]> {
    return this.pickupPointRepository.find({
      order: {
        createdAt: "ASC"
      },
      where: {
        status: "active"
      },
      relations: ['deliveryTimes']
    });
  }

  async findOne(id: number): Promise<PickupPoint> {
    const point = await this.pickupPointRepository.findOne({
      where: { id },
      relations: ['deliveryTimes'],
    });

    if (!point) {
      throw new NotFoundException(`Pickup point with ID ${id} not found`);
    }

    return point;
  }

  async update(id: number, updateDto: UpdatePickupPointDto): Promise<PickupPoint> {
    const point = await this.findOne(id);


    if (updateDto.name) point.name = updateDto.name;
    if (updateDto.radius) point.radius = updateDto.radius;
    if (updateDto.address) {
      if (updateDto.address.postal_code) point.postal_code = updateDto.address.postal_code;
      if (updateDto.address.fias_id) point.fias_id = updateDto.address.fias_id;
      if (updateDto.address.geo_lat) point.geo_lat = updateDto.address.geo_lat;
      if (updateDto.address.geo_lon) point.geo_lon = updateDto.address.geo_lon;
    }
    if (updateDto.status) point.status = updateDto.status;

    if (updateDto.deliveryTimes) {
      // Удаляем старые deliveryTimes
      if (point.deliveryTimes && point.deliveryTimes.length > 0) {
        await this.deliveryTimeRepository.remove(point.deliveryTimes);
      }
      
      // Создаем новые
      const deliveryTimes = updateDto.deliveryTimes.map(timeDto =>
        this.deliveryTimeRepository.create({
          ...timeDto,
          pickupPoint: point,
        })
      );
      point.deliveryTimes = await this.deliveryTimeRepository.save(deliveryTimes);
    }

    return this.pickupPointRepository.save(point);
  }

  async remove(id: number): Promise<void> {
    const point = await this.pickupPointRepository.findOne({
      where: { id },
      relations: ['deliveryTimes']
    });
    
    if (!point) {
      throw new NotFoundException('Pickup point not found');
    }
  
    await this.pickupPointRepository.update(id, {
      status: 'deleted'
    });
  }
}