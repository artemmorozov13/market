import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateDeliveryTimeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEnum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  dayOfWeek: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}