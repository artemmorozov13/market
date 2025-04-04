import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { PickupPoint } from 'src/entities/pickup-point.entity';
import { DeliveryTime } from 'src/entities/delivery-time.entity';
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
    });

    const savedPoint = await this.pickupPointRepository.save(pickupPoint);

    const deliveryTimes = createDto.deliveryTimes.map(timeDto =>
      this.deliveryTimeRepository.create({
        ...timeDto,
        pickupPoint: savedPoint,
      })
    );

    savedPoint.deliveryTimes = await this.deliveryTimeRepository.save(deliveryTimes);
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

    if (updateDto.deliveryTimes) {
      point.deliveryTimes = await this.deliveryTimeRepository.save(updateDto.deliveryTimes);
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
  
    // await this.deliveryTimeRepository.remove(point.deliveryTimes);
    
    await this.pickupPointRepository.update(id, {
      status: 'deleted'
    });
  }
}