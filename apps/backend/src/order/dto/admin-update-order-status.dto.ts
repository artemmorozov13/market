import { OrderStatusEnum } from '@core/enums/order-status-enum';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class AdminUpdateOrderStatusDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  orderIds: number[];

  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.status === OrderStatusEnum.CancelByAdmin)
  @IsNotEmpty()
  cancelReason?: string;
}