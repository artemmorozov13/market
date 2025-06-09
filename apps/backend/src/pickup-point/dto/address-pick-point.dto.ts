import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddressDataDto {
    @IsString()
    fullAddress: string;

    @IsString()
    @IsOptional()
    postal_code: string | null;

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