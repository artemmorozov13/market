import { IsString, IsNumber, IsIn, IsOptional } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsIn(['гр', 'кг', 'шт'])
    @IsOptional()
    unitOfMeasurement?: 'гр' | 'кг' | 'шт';
}