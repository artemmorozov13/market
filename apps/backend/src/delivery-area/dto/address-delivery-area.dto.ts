import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class AddressDataDto {
    @IsString({ message: 'Полный адрес должен быть строкой' })
    @IsNotEmpty({ message: 'Полный адрес обязателен' })
    fullAddress: string;

    @IsOptional()
    @IsString({ message: 'Почтовый индекс должен быть строкой или null' })
    postal_code?: string | null;

    @IsString({ message: 'FIAS ID должен быть строкой' })
    @IsNotEmpty({ message: 'FIAS ID обязателен' })
    fias_id: string;

    @IsString({ message: 'Широта должна быть строкой' })
    @Matches(/^-?\d{1,3}\.\d+$/, { 
        message: 'Широта должна быть в формате XX.XXXXX (например: 60.709642)' 
    })
    geo_lat: string;

    @IsString({ message: 'Долгота должна быть строкой' })
    @Matches(/^-?\d{1,3}\.\d+$/, { 
        message: 'Долгота должна быть в формате XX.XXXXX (например: 28.761765)' 
    })
    geo_lon: string;
}