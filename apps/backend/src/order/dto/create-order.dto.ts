import { IsNumber, IsString, IsOptional, IsDateString, ValidateIf, IsEnum, IsObject, IsNotEmptyObject, IsNotEmpty } from 'class-validator';
import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum';
import { AddressType } from '@core/types/address-type';

export class CreateOrderDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional() // Сделаем необязательным, так как может быть null в форме
  deliveryDate?: string;

  @IsNumber()
  storeId: number;

  @IsEnum(['delivery', 'pickup'])
  deliveryMethod: 'delivery' | 'pickup';

  @IsEnum(DeliveryStrategyEnum)
  deliveryStrategy: DeliveryStrategyEnum;

  // Поля для доставки
  @ValidateIf(o => o.deliveryMethod === 'delivery')
  @IsNumber()
  @IsOptional() // Сделаем необязательным для адаптации null из формы
  deliveryAreaId?: number;

  @ValidateIf(o => o.deliveryMethod === 'delivery')
  @IsNumber()
  @IsOptional()
  deliveryTimeId?: number;

  @ValidateIf(o => o.deliveryMethod === 'delivery')
  @IsObject()
  @IsNotEmptyObject(null, {
    message: 'Адрес доставки должен быть заполнен'
  })
  address: AddressType;

  @ValidateIf(o => o.deliveryMethod === 'delivery')
  @IsString()
  @IsNotEmpty({
    message: 'ID адреса должен быть указан'
  })
  addressId: string;

  // Поля для самовывоза
  @ValidateIf(o => o.deliveryMethod === 'pickup')
  @IsNumber()
  @IsOptional()
  pickupPointId?: number;
}
