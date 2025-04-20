import { IsNumber, IsString, IsOptional, IsDateString, IsDate } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  address: string;

  @IsString()
  fullAddress: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDate()
  deliveryDate: Date;

  @IsNumber()
  pickupPointId: number;

  @IsNumber()
  deliveryTimeId: number;
}