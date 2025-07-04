import { UpdateWorkingHoursDto } from '@app/pickup-working-hours/dto/update-working-hours.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdatePickupPointDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsString()
  fias_id?: string;

  @IsOptional()
  @IsString()
  geo_lat?: string;

  @IsOptional()
  @IsString()
  geo_lon?: string;

  @IsOptional()
  @IsNumber()
  storeId?: number;

  @IsOptional()
  @IsEnum(['active', 'deleted'])
  status?: 'active' | 'deleted';

  @IsOptional()
  workingHours?: UpdateWorkingHoursDto[];
}