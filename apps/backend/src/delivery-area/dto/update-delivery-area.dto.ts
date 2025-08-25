import { IsString, ValidateNested, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDataDto } from './address-delivery-area.dto';
import { CreateDeliveryTimeDto } from '@app/delivery-times/dto/create-delivery-times.dto';
import { UpdateDeliveryTimeDto } from '@app/delivery-times/dto/update-delivery-times.dto';

export class UpdateDeliveryAreaDto {
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  radius: number;

  @ValidateNested()
  @Type(() => AddressDataDto)
  @IsOptional()
  address?: AddressDataDto;

  @IsEnum(['active', 'deleted'])
  @IsOptional()
  status?: 'active' | 'deleted';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDeliveryTimeDto)
  @IsOptional()
  deliveryTimes?: UpdateDeliveryTimeDto[];
}