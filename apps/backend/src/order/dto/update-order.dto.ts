import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

export class UpdateOrderDto {
  @IsNumber()
  id: number

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @IsOptional()
  products?: OrderProductDto[];
}