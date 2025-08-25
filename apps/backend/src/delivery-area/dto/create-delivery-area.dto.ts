import { IsString, ValidateNested, IsArray, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDataDto } from './address-delivery-area.dto';
import { CreateDeliveryTimeDto } from '@app/delivery-times/dto/create-delivery-times.dto';

export class CreateDeliveryAreaDto {
  @IsString({ message: 'Название должно быть строкой' })
  name: string;

  @IsNumber({}, { message: 'Радиус должен быть числом' })
  @Type(() => Number)
  radius: number;

  @ValidateNested({ message: 'Адрес должен быть объектом с полями адреса' })
  @Type(() => AddressDataDto)
  address: AddressDataDto;

  @IsArray({ message: 'Время доставки должно быть массивом' })
  @ValidateNested({ each: true, message: 'Каждый элемент времени доставки должен быть валидным' })
  @Type(() => CreateDeliveryTimeDto)
  @IsOptional()
  deliveryTimes?: CreateDeliveryTimeDto[];
}