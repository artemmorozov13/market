import { IsEnum, IsNumber, IsPositive, IsString } from "class-validator";

export class UpdateOrderStatusDto {
    @IsNumber()
    @IsPositive()
    orderId: number
}