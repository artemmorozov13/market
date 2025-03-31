import { IsNumber, IsOptional, IsPositive } from "class-validator"

export class GetOrderQueryDto {
    @IsNumber()
    @IsOptional()
    skip: number

    @IsNumber()
    @IsPositive()
    @IsOptional()
    limit: number
}