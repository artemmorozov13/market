import { IsString } from 'class-validator';

export class CreateDeliveryTimeDto {
  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}