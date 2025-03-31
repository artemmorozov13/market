import { IsArray, IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsIn(['waitForPay', 'payConfirm', 'finished'])
  @IsOptional()
  status?: 'waitForPay' | 'payConfirm' | 'finished';

  @IsArray()
  @IsOptional()
  productIds?: number[];
}