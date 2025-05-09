import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class StatisticService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
    ) {}

    async getOrderStatistic() {
        const now = new Date(); // Текущая дата и время (UTC)
        
        // Получаем начало текущей недели (понедельник, 00:00:00 по MSK)
        const startOfWeek = new Date(now);
        
        // Корректируем на MSK (UTC+3)
        startOfWeek.setHours(startOfWeek.getHours() - 3); // Приводим к MSK
        
        // Находим понедельник текущей недели
        const dayOfWeek = startOfWeek.getDay(); // 0 (воскресенье) - 6 (суббота)
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Если воскресенье, откатываем на 6 дней назад
        startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0); // Начало дня (00:00:00)
        
        // Возвращаемся к UTC для корректного сравнения в БД
        startOfWeek.setHours(startOfWeek.getHours() + 3); // MSK → UTC
        
        // Если now тоже нужно в UTC, оставляем как есть (так как БД хранит UTC)
        // Или корректируем now аналогично, если createdAt хранится в MSK
        
        const orders = await this.orderRepository.find({
            where: {
                createdAt: Between(startOfWeek, now), // Сравнение в UTC
            },
            relations: [
                'user',
                'ordered_products.product',
                'pickupPoint',
                'deliveryTime',
            ],
        });
    
        return orders;
    }
}
