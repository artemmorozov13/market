import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryTimeDto {
  @IsString()
  dayOfWeek: string

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean
}
