import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryTimeDto } from './create-delivery-time.dto';

export class CreatePickupPointDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryTimeDto)
  deliveryTimes: CreateDeliveryTimeDto[];
}