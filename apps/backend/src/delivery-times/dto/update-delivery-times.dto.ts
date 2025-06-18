import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryTimeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isActive: boolean
}
