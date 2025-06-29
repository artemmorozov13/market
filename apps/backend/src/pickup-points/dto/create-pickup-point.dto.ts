// create-pickup-point.dto.ts
import { CreateWorkingHoursDto } from '@app/pickup-working-hours/dto/create-working-hours.dto';
import { IsNotEmpty, IsString, IsOptional, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePickupPointDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkingHoursDto)
  workingHours?: CreateWorkingHoursDto[];
}