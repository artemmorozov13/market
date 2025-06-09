import { Type } from "class-transformer"
import { IsArray, IsNumber, IsOptional, IsPositive } from "class-validator"

export class GetOrderQueryDto {
    @IsNumber()
    @IsOptional()
    skip: number

    @IsNumber()
    @IsPositive()
    @IsOptional()
    limit: number

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    pickupPointId?: number[]
}