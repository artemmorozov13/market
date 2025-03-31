import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryTimeDto } from './create-delivery-time.dto';

export class UpdatePickupPointDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryTimeDto)
  @IsOptional()
  deliveryTimes?: CreateDeliveryTimeDto[];
}