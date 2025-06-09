import { IsNumber } from 'class-validator';

export class RemoveProductFromBasketDto {
  @IsNumber()
  productId: number;
}