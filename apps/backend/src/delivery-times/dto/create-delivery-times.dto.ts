import { WeekdayEnum } from "@core/enums/weekday.enum"
import { IsBoolean, IsOptional, IsString, Matches, IsEnum } from 'class-validator';

export class CreateDeliveryTimeDto {
    @IsString({ message: 'День недели должен быть строкой' })
    @IsEnum(WeekdayEnum, { 
        message: 'День недели должен быть одним из: monday, tuesday, wednesday, thursday, friday, saturday, sunday' 
    })
    dayOfWeek: WeekdayEnum;

    @IsString({ message: 'Время начала должно быть строкой' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
        message: 'Время начала должно быть в формате HH:MM (например: 09:00)' 
    })
    startTime: string;

    @IsString({ message: 'Время окончания должно быть строкой' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
        message: 'Время окончания должно быть в формате HH:MM (например: 18:00)' 
    })
    endTime: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive должен быть boolean' })
    isActive?: boolean = true;
}