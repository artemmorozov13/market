import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  pickupPointId: number;

  @IsNumber()
  deliveryTimeId: number;
}