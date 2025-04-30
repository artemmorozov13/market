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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
        const orders = await this.orderRepository.find({
            where: {
                createdAt: Between(startOfMonth, now),
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
