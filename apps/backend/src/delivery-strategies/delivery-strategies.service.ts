import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddStrategyToStoreDto } from './dto/add-strategy.dto';
import { UpdateStoreStrategyDto } from './dto/update-strategy.dto';
import { DeliveryStrategy } from '@core/entities/delivery-strategy.entity';
import { StoreDeliveryStrategy } from '@core/entities/store-delivery-strategy.entity';
import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum';

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
    // Проверяем существование стратегии
    const strategy = await this.strategyRepository.findOne({ 
      where: { id: dto.strategyId },
    });
    
    if (!strategy) {
      throw new NotFoundException(`Strategy with id ${dto.strategyId} not found`);
    }

    // Проверяем, не добавлена ли уже эта стратегия для магазина
    const existing = await this.storeStrategyRepository.findOne({
      where: {
        store: { id: storeId },
        strategy: { id: dto.strategyId },
      },
    });

    if (existing) {
      throw new ConflictException('This strategy already added to the store');
    }

    // Создаем новую связь магазина со стратегией
    const storeStrategy = this.storeStrategyRepository.create({
      store: { id: storeId },
      strategy: { id: dto.strategyId },
    });

    return this.storeStrategyRepository.save(storeStrategy);
  }

  async updateStoreStrategy(storeId: number, dto: UpdateStoreStrategyDto) {
    // Находим связь магазина со стратегией
    const storeStrategy = await this.storeStrategyRepository.findOne({
      where: {
        store: { id: storeId },
        strategy: { id: dto.strategyId },
      },
      relations: ['strategy'],
    });

    if (!storeStrategy) {
      throw new NotFoundException('Store strategy connection not found');
    }

    // Здесь можно добавить логику обновления, если нужно
    // В текущей реализации просто возвращаем найденную запись
    return storeStrategy;
  }

  async removeStrategyFromStore(storeId: number, strategyId: number) {
    return await this.storeStrategyRepository.delete({
      id: strategyId,
      store: {
        id: storeId
      },
    });
  }

  // Новый метод для получения стратегий по типу
  async getStrategyByType(type: DeliveryStrategyEnum): Promise<DeliveryStrategy | undefined> {
    return this.strategyRepository.findOne({ where: { type } });
  }
}