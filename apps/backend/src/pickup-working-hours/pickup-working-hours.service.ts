import { CreateWorkingHoursDto } from '@app/pickup-working-hours/dto/create-working-hours.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import { PickupWorkingHoursEntity } from '@core/entities';

@Injectable()
export class PickupWorkingHoursService {
  constructor(
    @InjectRepository(PickupWorkingHoursEntity)
    private readonly repository: Repository<PickupWorkingHoursEntity>,
  ) {}

  async removeAllForPickupPoint(pickupPointId: number): Promise<void> {
    await this.repository.delete({ id: pickupPointId });
  }

  async createMany(dtos: CreateWorkingHoursDto[]): Promise<PickupWorkingHoursEntity[]> {
    const entities = dtos.map(dto => this.repository.create(dto));
    return this.repository.save(entities);
  }

  async updateMany(
    pickupPointId: number, 
    dtos: UpdateWorkingHoursDto[]
  ): Promise<PickupWorkingHoursEntity[]> {
    await this.removeAllForPickupPoint(pickupPointId);
    
    const createDtos: UpdateWorkingHoursDto[] = dtos.map(dto => ({
      ...dto,
      pickupPointId,
    }));
    
    return this.createMany(createDtos as any);
  }

  async findByPickupPointId(pickupPointId: number): Promise<PickupWorkingHoursEntity[]> {
    return this.repository.find({ where: { id: pickupPointId } });
  }
}