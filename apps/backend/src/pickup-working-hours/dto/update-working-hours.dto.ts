import { WeekdayEnum } from '@core/enums/weekday.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWorkingHoursDto {
  @IsOptional()
  @IsEnum(WeekdayEnum)
  dayOfWeek?: WeekdayEnum;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsOptional()
  pickupPointId?: number;
}