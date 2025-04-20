import { IsNotEmpty, IsString } from "class-validator";

export class AddressDataDto {
    @IsString()
    fullAddress: string;

    @IsString()
    @IsNotEmpty()
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