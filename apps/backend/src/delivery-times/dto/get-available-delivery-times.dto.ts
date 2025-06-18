import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class GetAvailableDeliveryTimesDto {
  @IsNumber()
  pickupPointId: number;
}