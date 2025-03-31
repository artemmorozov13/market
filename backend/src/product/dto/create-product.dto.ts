import { IsString, IsNumber, IsIn, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
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