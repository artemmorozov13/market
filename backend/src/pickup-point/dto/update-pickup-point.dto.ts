import { IsString, ValidateNested, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryTimeDto } from './create-delivery-time.dto';
import { AddressDataDto } from './address-pick-point.dto';

export class UpdatePickupPointDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDataDto)
  @IsOptional()
  address?: AddressDataDto;

  @IsEnum(['active', 'deleted'])
  @IsOptional()
  status?: 'active' | 'deleted';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryTimeDto)
  @IsOptional()
  deliveryTimes?: CreateDeliveryTimeDto[];
}