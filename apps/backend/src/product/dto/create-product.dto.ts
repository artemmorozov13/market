import { IsString, IsNumber, IsIn, IsNotEmpty, IsInt } from 'class-validator';

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

    @IsIn(['гр', 'кг', 'шт'])
    @IsNotEmpty()
    unitOfMeasurement: 'гр' | 'кг' | 'шт';
}