import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format, isAfter, isBefore, subHours } from 'date-fns';
import { CreateDeliveryTimeDto } from './dto/create-delivery-times.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-times.dto';
import { DeliveryTimeBase } from '@core/types/delivery-time';
import { DeliveryTimeStoreResolver } from './lib/delivery-time-store-resolver';
import { AuthJwtPayload } from '@core/types/user-type';
import { convertToStoreTimezone } from './lib/convert-to-store-timezone';

@Injectable()
export class DeliveryTimesService {
    constructor(
        @InjectRepository(DeliveryTime)
        private deliveryTimeRepository: Repository<DeliveryTime>,
        private readonly deliveryTimeStoreResolver: DeliveryTimeStoreResolver
    ) {}

    async findByDeliveryArea(deliveryAreaId: number): Promise<DeliveryTime[]> {
        return this.deliveryTimeRepository.find({
            where: { deliveryArea: { id: deliveryAreaId } },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });
    }

    async getAvailableDeliveryTimes(
        deliveryAreaId: number,
        userJwt: AuthJwtPayload,
        options: { includePassedTimes?: boolean } = {}
    ): Promise<DeliveryTimeBase[]> {
        const { includePassedTimes = false } = options;
        const store = await this.deliveryTimeStoreResolver.resolveStore(userJwt);
        
        // Конвертируем текущее время в часовой пояс магазина
        const currentDate = convertToStoreTimezone(new Date(), store.timezone);

        const allTimes = await this.deliveryTimeRepository.find({
            where: { deliveryArea: { id: deliveryAreaId }, isActive: true },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });

        if (!allTimes.length) return [];

        // Группируем по дням недели
        const timesByDay = allTimes.reduce((acc, time) => {
            acc[time.dayOfWeek] = acc[time.dayOfWeek] || [];
            acc[time.dayOfWeek].push(time);
            return acc;
        }, {});

        const result = [];
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        const currentDayOfWeek = currentDate.getDay();
        const daysToCheck = store.isWeekLimited ? 6 : 13; // Проверяем 2 недели если нет ограничения

        for (let i = 0; i <= daysToCheck; i++) {
            const targetDate = new Date(currentDate);
            targetDate.setDate(currentDate.getDate() + i);
            const targetDayOfWeek = daysOfWeek[targetDate.getDay()];
            const dayTimes = timesByDay[targetDayOfWeek] || [];

            const availableTimes = dayTimes.filter(time => {
                const deliveryStart = this.combineDateAndTime(targetDate, time.startTime);
                const deliveryEnd = this.combineDateAndTime(targetDate, time.endTime);

                // 1. Проверка для текущего дня (исключаем прошедшее время)
                if (i === 0 && !includePassedTimes) {
                    if (isBefore(deliveryEnd, currentDate)) {
                        return false;
                    }
                }

                // 2. Проверка дедлайна заказа
                const orderDeadline = subHours(deliveryStart, store.minOrderBeforeDeliveryHours);
                return isAfter(orderDeadline, currentDate);
            });

            if (availableTimes.length > 0) {
                result.push({
                    date: format(targetDate, 'yyyy-MM-dd'),
                    dayOfWeek: targetDayOfWeek,
                    times: availableTimes.map(t => ({
                        id: t.id,
                        startTime: t.startTime,
                        endTime: t.endTime
                    }))
                });
            }
        }

        return result;
    }

    async createDeliveryTimes(
        deliveryAreaId: number,
        times: CreateDeliveryTimeDto[]
    ): Promise<DeliveryTime[]> {
        const deliveryTimes = times.map(time => 
            this.deliveryTimeRepository.create({
                ...time,
                deliveryArea: { id: deliveryAreaId },
                isActive: true,
            })
        );
        
        return this.deliveryTimeRepository.save(deliveryTimes);
    }

    async updateDeliveryTimes(
        deliveryAreaId: number,
        times: UpdateDeliveryTimeDto[]
    ): Promise<DeliveryTime[]> {
        // Удаляем старые времена, которых нет в новом списке
        const existingTimes = await this.findByDeliveryArea(deliveryAreaId);
        const timesToKeep = times.filter(t => t.id).map(t => t.id);
        const timesToRemove = existingTimes.filter(t => !timesToKeep.includes(t.id));
        
        if (timesToRemove.length > 0) {
            await this.deliveryTimeRepository.remove(timesToRemove);
        }

        // Создаем/обновляем времена
        const deliveryTimes = times.map(time => {
            if (time.id) {
                return this.deliveryTimeRepository.create({
                    id: time.id,
                    ...time,
                    deliveryArea: { id: deliveryAreaId }
                });
            }
            return this.deliveryTimeRepository.create({
                ...time,
                deliveryArea: { id: deliveryAreaId },
                isActive: time.isActive ?? true
            });
        });

        return this.deliveryTimeRepository.save(deliveryTimes);
    }

    private combineDateAndTime(date: Date, timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const result = new Date(date);
        result.setHours(hours, minutes, 0, 0);
        return result;
    }
}
