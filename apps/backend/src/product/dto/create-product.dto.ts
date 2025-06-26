import { UnitOfMeasuresEnum } from '@core/enums/units-of-measures';
import { IsString, IsNumber, IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsInt()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    discount: number;

    @IsString()
    @IsNotEmpty()
    image: string;

    @IsNumber()
    unitValue: number

    @IsEnum(UnitOfMeasuresEnum)
    @IsNotEmpty()
    unitOfMeasurement: UnitOfMeasuresEnum;
}