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
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
    
        const orders = await this.orderRepository.find({
            where: {
                createdAt: Between(startOfWeek, now),
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
