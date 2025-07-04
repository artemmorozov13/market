import { IsNumber } from "class-validator";

export class CancelUserOrderDto {
    @IsNumber()
    orderId: number
}