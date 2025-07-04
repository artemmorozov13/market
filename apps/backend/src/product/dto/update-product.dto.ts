import { UnitOfMeasuresEnum } from '@core/enums/units-of-measures';
import { IsString, IsNumber, IsIn, IsOptional, IsEnum } from 'class-validator';

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
    offeredPrice?: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsEnum(UnitOfMeasuresEnum)
    @IsOptional()
    unitOfMeasurement?: UnitOfMeasuresEnum;
}