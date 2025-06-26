import { IsNumber, IsOptional } from "class-validator";

export class FindPickupPointDto {
    @IsOptional()
    @IsNumber()
    storeId: number
}