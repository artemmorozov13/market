import { WeekdayEnum } from '@core/enums/weekday.enum';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateDeliveryTimeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEnum(WeekdayEnum)
  dayOfWeek: WeekdayEnum;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}