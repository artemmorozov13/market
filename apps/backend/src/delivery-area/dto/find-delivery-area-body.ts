import { IsNumber, IsOptional } from "class-validator";

export class FindDeliveryAreaDto {
    @IsOptional()
    @IsNumber()
    storeId: number
}