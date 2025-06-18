import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isAfter } from 'date-fns';
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

    async findByPickupPoint(pickupPointId: number): Promise<DeliveryTime[]> {
        return this.deliveryTimeRepository.find({
            where: { pickupPoint: { id: pickupPointId } },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });
    }

    async getAvailableDeliveryTimes(
        pickupPointId: number,
        userJwt: AuthJwtPayload,
        options: { includePassedTimes?: boolean } = {}
    ): Promise<DeliveryTimeBase[]> {
        const { includePassedTimes = false } = options;
        const store = await this.deliveryTimeStoreResolver.resolveStore(userJwt);
        
        // Конвертируем текущее время в часовой пояс магазина
        const currentDate = convertToStoreTimezone(new Date(), store.timezone);

        const allTimes = await this.deliveryTimeRepository.find({
            where: { pickupPoint: { id: pickupPointId }, isActive: true },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });

        console.log("Все интервалы доставки из БД:", JSON.stringify(allTimes, null, 2));

        if (!allTimes.length) return [];

        const timesByDay = allTimes.reduce((acc, time) => {
            acc[time.dayOfWeek] = acc[time.dayOfWeek] || [];
            acc[time.dayOfWeek].push(time);
            return acc;
        }, {});

        const result = [];
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        const currentDayOfWeek = currentDate.getDay();
        const daysToCheck = store.isWeekLimited ? 6 - currentDayOfWeek : 13;

        for (let i = 0; i <= daysToCheck; i++) {
            const targetDate = new Date(currentDate);
            targetDate.setDate(currentDate.getDate() + i);
            const targetDayOfWeek = daysOfWeek[targetDate.getDay()];
            const dayTimes = timesByDay[targetDayOfWeek] || [];

            console.log(`\nПроверяем день: ${targetDate.toISOString().split('T')[0]} (${targetDayOfWeek})`);

            const availableTimes = dayTimes.filter(time => {
                const deliveryStart = this.combineDateAndTime(targetDate, time.startTime);
                console.log(`- Интервал: ${time.startTime} → ${time.endTime}`);

                // 1. Проверка, не прошло ли время доставки (если includePassedTimes = false)
                if (i === 0 && !includePassedTimes) {
                    const isDeliveryInFuture = isAfter(deliveryStart, currentDate);
                    console.log(`  • Доставка сегодня. Время ещё не прошло? ${isDeliveryInFuture}`);
                    if (!isDeliveryInFuture) return false;
                }

                // 2. Проверка дедлайна заказа (за X часов до доставки)
                const orderDeadline = new Date(deliveryStart);
                orderDeadline.setHours(orderDeadline.getHours() - store.minOrderBeforeDeliveryHours);
                
                const isBeforeDeadline = isAfter(orderDeadline, currentDate);
                console.log(`  • Дедлайн заказа: ${orderDeadline.toISOString()}`);
                console.log(`  • Текущее время < дедлайна? ${isBeforeDeadline}`);

                return isBeforeDeadline;
            });

            if (availableTimes.length > 0) {
                result.push({
                    date: targetDate.toISOString().split('T')[0],
                    dayOfWeek: targetDayOfWeek,
                    times: availableTimes.map(t => ({
                        id: t.id,
                        startTime: t.startTime,
                        endTime: t.endTime
                    }))
                });
            }
        }

        console.log("\nРезультат фильтрации:", JSON.stringify(result, null, 2));
        return result;
    }

    async createDeliveryTimes(
        pickupPointId: number,
        times: CreateDeliveryTimeDto[]
    ): Promise<DeliveryTime[]> {
        const deliveryTimes = times.map(time => 
            this.deliveryTimeRepository.create({
                ...time,
                pickupPoint: { id: pickupPointId },
                isActive: true
            })
        );
        
        return this.deliveryTimeRepository.save(deliveryTimes);
    }

    async updateDeliveryTimes(
        pickupPointId: number,
        times: UpdateDeliveryTimeDto[]
    ): Promise<DeliveryTime[]> {
        // Удаляем старые времена, которых нет в новом списке
        const existingTimes = await this.findByPickupPoint(pickupPointId);
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
                    pickupPoint: { id: pickupPointId }
                });
            }
            return this.deliveryTimeRepository.create({
                ...time,
                pickupPoint: { id: pickupPointId },
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
