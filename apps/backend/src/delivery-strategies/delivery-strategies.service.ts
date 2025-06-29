import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddStrategyToStoreDto } from './dto/add-strategy.dto';
import { UpdateStoreStrategyDto } from './dto/update-strategy.dto';
import { DeliveryStrategy } from '@core/entities/delivery-strategy.entity';
import { StoreDeliveryStrategy } from '@core/entities/store-delivery-strategy.entity';

@Injectable()
export class DeliveryStrategiesService {
  constructor(
    @InjectRepository(DeliveryStrategy)
    private readonly strategyRepository: Repository<DeliveryStrategy>,
    @InjectRepository(StoreDeliveryStrategy)
    private readonly storeStrategyRepository: Repository<StoreDeliveryStrategy>,
  ) {}

  async getAllStrategies(): Promise<DeliveryStrategy[]> {
    return this.strategyRepository.find();
  }

  async getStoreStrategies(storeId: number): Promise<StoreDeliveryStrategy[]> {
    return this.storeStrategyRepository.find({
      where: { store: { id: storeId } },
      relations: ['strategy'],
    });
  }

  async addStrategyToStore(storeId: number, dto: AddStrategyToStoreDto) {
    const strategy = await this.strategyRepository.findOneBy({ id: dto.strategyId });
    if (!strategy) throw new NotFoundException('Strategy not found');

    const existing = await this.storeStrategyRepository.findOne({
      where: {
        store: { id: storeId },
        strategy: { id: dto.strategyId },
      },
    });

    if (existing) {
      throw new ConflictException('Strategy already added to store');
    }

    const storeStrategy = this.storeStrategyRepository.create({
      store: { id: storeId },
      strategy,
    });

    return this.storeStrategyRepository.save(storeStrategy);
  }

  async updateStoreStrategy(storeId: number, dto: UpdateStoreStrategyDto) {
    const storeStrategy = await this.storeStrategyRepository.findOne({
      where: {
        store: { id: storeId },
        strategy: { id: dto.strategyId },
      },
    });

    if (!storeStrategy) throw new NotFoundException('Store strategy not found');

    return this.storeStrategyRepository.save(storeStrategy);
  }

  async removeStrategyFromStore(storeId: number, strategyId: number) {
    const result = await this.storeStrategyRepository.delete({
      store: { id: storeId },
      strategy: { id: strategyId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Store strategy not found');
    }
  }
}