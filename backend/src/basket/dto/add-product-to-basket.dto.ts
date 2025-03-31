import { IsNumber, IsPositive } from 'class-validator';

export class AddProductToBasketDto {
  @IsNumber()
  @IsPositive()
  productId: number;
}