import { IsBoolean, IsNumber, IsOptional, IsPositive } from "class-validator"

export class PaginationDto {
    @IsNumber()
    @IsOptional()
    skip: number

    @IsNumber()
    @IsPositive()
    @IsOptional()
    limit: number

    @IsBoolean()
    @IsOptional()
    is_expired?: boolean
}