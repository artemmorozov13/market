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
        console.log(`Текущая дата: ${currentDate}, день недели: ${currentDate.getDay()}`);

        const allTimes = await this.deliveryTimeRepository.find({
            where: {
                deliveryArea: { id: deliveryAreaId },
                isActive: true
            },
            order: {
                dayOfWeek: 'ASC',
                startTime: 'ASC'
            }
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
        
        // Определяем границы доступного периода
        const currentDayOfWeek = currentDate.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
        const endDate = new Date(currentDate);
        
        if (store.isWeekLimited) {
            // Если сегодня воскресенье, показываем только сегодня
            if (currentDayOfWeek === 0) {
                endDate.setDate(currentDate.getDate());
            } else {
                // Иначе показываем до воскресенья текущей недели
                endDate.setDate(currentDate.getDate() + (7 - currentDayOfWeek));
            }
            console.log(`Ограниченная неделя. Конечная дата: ${endDate}`);
        } else {
            // Показываем на 2 недели вперед (включая воскресенье)
            endDate.setDate(currentDate.getDate() + 13);
            console.log(`Полные 2 недели. Конечная дата: ${endDate}`);
        }

        console.log(`Начальная дата: ${currentDate}, конечная дата: ${endDate}`);

        const tempDate = new Date(currentDate);
        while (tempDate <= endDate) {
            const targetDayOfWeek = daysOfWeek[tempDate.getDay()];
            const dayTimes = timesByDay[targetDayOfWeek] || [];

            console.log(`Проверяем дату: ${tempDate}, день недели: ${targetDayOfWeek}`);

            const availableTimes = dayTimes.filter(time => {
                const deliveryStart = this.combineDateAndTime(new Date(tempDate), time.startTime);
                const deliveryEnd = this.combineDateAndTime(new Date(tempDate), time.endTime);

                // Проверка для текущего дня (исключаем прошедшее время)
                if (tempDate.getDate() === currentDate.getDate() && 
                    tempDate.getMonth() === currentDate.getMonth() && 
                    tempDate.getFullYear() === currentDate.getFullYear() && 
                    !includePassedTimes) {
                    if (isBefore(deliveryEnd, currentDate)) {
                        console.log(`Исключаем прошедшее время: ${time.startTime}-${time.endTime}`);
                        return false;
                    }
                }

                // Проверка дедлайна заказа
                const orderDeadline = subHours(deliveryStart, store.minOrderBeforeDeliveryHours);
                const isAvailable = isAfter(orderDeadline, currentDate);
                if (!isAvailable) {
                    console.log(`Время ${time.startTime}-${time.endTime} недоступно: дедлайн ${orderDeadline} уже прошел`);
                }
                return isAvailable;
            });

            if (availableTimes.length > 0) {
                console.log(`Добавляем доступные времена для ${tempDate}:`, availableTimes);
                result.push({
                    date: format(new Date(tempDate), 'yyyy-MM-dd'),
                    dayOfWeek: targetDayOfWeek,
                    times: availableTimes.map(t => ({
                        id: t.id,
                        startTime: t.startTime,
                        endTime: t.endTime
                    }))
                });
            } else {
                console.log(`Нет доступных времен для ${tempDate}`);
            }

            // Переходим к следующему дню
            tempDate.setDate(tempDate.getDate() + 1);
        }

        console.log('Итоговый результат:', result);
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
