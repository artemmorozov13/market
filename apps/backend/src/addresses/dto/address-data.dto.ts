import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddressDataDto {
    @IsString()
    @IsOptional()
    postal_code: string;

    @IsString()
    @IsNotEmpty()
    fias_id: string;

    @IsString()
    @IsNotEmpty()
    geo_lat: string;

    @IsString()
    @IsNotEmpty()
    geo_lon: string;
}