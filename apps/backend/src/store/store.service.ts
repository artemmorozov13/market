import { StoreEntity } from '@core/entities/store.entity';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStoreDto } from './dto/updatestore.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { StoreUserService } from '@app/store-user/store-user.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Roles } from '@core/enums/role-enum';
import { ProductStatusEnum } from '@core/enums/product-status-enum';
import { DeliveryStrategiesService } from '@app/delivery-strategies/delivery-strategies.service';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { DateTime } from 'luxon';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreEntity)
        private readonly storeRepository: Repository<StoreEntity>,
        @Inject(forwardRef(() => StoreUserService))
        private readonly storeUserService: StoreUserService,
        @Inject(forwardRef(() => DeliveryStrategiesService))
        private readonly deliveryStrategiesService: DeliveryStrategiesService,
        @InjectRepository(DeliveryTime)
        private readonly deliveryTimeRepository: Repository<DeliveryTime>
    ) {}

    async getStoreUserByToken(userJwt: AuthJwtPayload, page: number, limit: number) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Math.min(Number(limit), 100) || 10);

        const [stores, total] = await this.getStoresDataWithPagination(
            userJwt, 
            page, 
            limit
        );

        return {
            data: stores,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getStoresDataWithPagination(
        userJwt: AuthJwtPayload, 
        page: number = 1, 
        limit: number = 10
    ): Promise<[StoreEntity[], number]> {
        const skip = (page - 1) * limit;

        const query = this.storeRepository
            .createQueryBuilder('store')
            .leftJoinAndSelect(
                'store.products', 
                'product',
                'product.status IN (:...statuses)',
                { statuses: [ProductStatusEnum.Accepted, ProductStatusEnum.Active] }
            )
            .orderBy('store.name', 'ASC')
            .addOrderBy('product.name', 'ASC');

        const [stores, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return [stores, total];
    }

    async getStoreDataById(storeId: number) {
        const store = await this.storeRepository.findOne({
            where: { id: storeId },
            relations: [
                'products',
                'deliveryAreas',
                'pickupPoints',
                'pickupPoints.workingHours',
                'deliveryStrategies'
            ],
        });
        
        if (!store) {
            throw new BadRequestException("Данные магазина не найдены");
        }

        // Добавляем стратегии доставки
        const strategies = await this.deliveryStrategiesService.getStoreStrategies(storeId);
        return { ...store, deliveryStrategies: strategies };
    }

    async createStore(body: CreateStoreDto) {
        const newUser = await this.storeUserService.createUser({
            email: body.userEmail,
        });

        const store = this.storeRepository.create({
            name: body.name,
            description: body.description,
            logoUrl: body.logoUrl,
            telegramBotToken: body.telegramBotToken,
            isDeliveryFree: true,
            staff: [newUser],
        });

        return this.storeRepository.save(store);
    }

    async isDeliveryDateAvailable(
        store: StoreEntity,
        deliveryDate: Date,
        deliveryTimeId?: number
    ): Promise<{ available: boolean; reason?: string }> {
        const storeTimeZone = store.timezone || 'Europe/Moscow';
        console.log(`[1] Начало проверки. Часовой пояс магазина: ${storeTimeZone}`);
        
        const now = DateTime.now().setZone(storeTimeZone);
        const today = now.startOf('day');
        console.log(`[2] Текущая дата/время: ${now.toString()}, сегодня: ${today.toString()}`);

        const deliveryDateTime = DateTime.fromJSDate(deliveryDate).setZone(storeTimeZone);
        const deliveryDay = deliveryDateTime.startOf('day');
        console.log(`[3] Проверяемая дата доставки: ${deliveryDateTime.toString()}, день: ${deliveryDay.toString()}`);

        // 1. Проверка, что дата не в прошлом
        if (deliveryDay < today) {
            console.log(`[4] Ошибка: Дата в прошлом (${deliveryDay.toString()} < ${today.toString()})`);
            return { available: false, reason: "Нельзя выбрать прошедшую дату" };
        }

        // 2. Проверка ограничения недели
        if (store.isWeekLimited) {
            const currentWeekStart = today.startOf('week');
            const currentWeekEnd = today.endOf('week');
            console.log(`[5] Неделя: с ${currentWeekStart.toString()} по ${currentWeekEnd.toString()}`);

            if (deliveryDay < currentWeekStart || deliveryDay > currentWeekEnd) {
                console.log(`[6] Ошибка: Дата вне текущей недели`);
                return { available: false, reason: "В закрытом режиме работы нельзя заказывать вне текущей недели" };
            }
        }

        // 3. Проверка времени доставки
        if (deliveryTimeId && store.minOrderBeforeDeliveryHours) {
            const deliveryTime = await this.deliveryTimeRepository.findOne({ 
                where: { id: deliveryTimeId } 
            });

            if (!deliveryTime) {
                console.log(`[7] Ошибка: Время доставки не найдено`);
                return { available: false, reason: "Время доставки не найдено" };
            }

            const [hours, minutes] = deliveryTime.startTime.split(':').map(Number);
            const deliverySlot = deliveryDateTime.set({ hour: hours, minute: minutes });
            const hoursDiff = deliverySlot.diff(now, 'hours').hours;
            
            console.log(`[8] Время доставки: ${deliverySlot.toString()}, осталось часов: ${hoursDiff}, минимально требуется: ${store.minOrderBeforeDeliveryHours}`);

            if (hoursDiff < store.minOrderBeforeDeliveryHours) {
                console.log(`[9] Ошибка: Недостаточно времени для заказа`);
                return { 
                    available: false, 
                    reason: `Заказ нужно сделать минимум за ${store.minOrderBeforeDeliveryHours} часов до доставки` 
                };
            }
        }

        console.log(`[10] Дата доступна для заказа`);
        return { available: true };
    }

    async updateStoreData(userJwt: AuthJwtPayload, body: UpdateStoreDto) {
        const user = await this.storeUserService.getStoreUserById(userJwt.id);

        if (user.role !== Roles.Admin) {
            throw new ForbiddenException('Только владелец магазина может изменять данные');
        }

        const store = await this.storeRepository.findOne({
            where: { id: body.id, staff: { id: user.id } },
            relations: ['staff'],
        });

        if (!store) {
            throw new BadRequestException('Магазин не найден или у вас нет прав');
        }

        if (body.isDeliveryFree) {
            body.deliveryCost = 0;
            body.deliveryFreeFromLimit = 0;
        }

        await this.storeRepository.update(store.id, body);

        return this.storeRepository.findOne({ 
            where: { id: store.id },
            relations: ['staff'],
        });
    }

    async getStoreStrategies(storeId: number) {
        return this.deliveryStrategiesService.getStoreStrategies(storeId);
    }

    async addStrategyToStore(storeId: number, strategyId: number) {
        return this.deliveryStrategiesService.addStrategyToStore(storeId, {
            strategyId
        });
    }

    async removeStrategyFromStore(storeId: number, strategyId: number) {
        return this.deliveryStrategiesService.removeStrategyFromStore(storeId, strategyId);
    }

    async updateStoreStrategy(storeId: number, strategyId: number) {
        return this.deliveryStrategiesService.updateStoreStrategy(storeId, {
            strategyId
        });
    }
}