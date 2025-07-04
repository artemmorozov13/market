import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBasketDto {
  @IsNumber()
  @IsOptional()
  products_count?: number;

  @IsNumber()
  @IsOptional()
  userId?: number;
}