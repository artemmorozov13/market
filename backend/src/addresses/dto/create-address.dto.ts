import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { AddressDataDto } from './address-data.dto';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsString()
  @IsNotEmpty()
  entrance: string;

  @IsString()
  @IsNotEmpty()
  floor: string;

  @IsString()
  @IsNotEmpty()
  apartment: string;

  @IsString()
  @IsNotEmpty()
  intercom: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  addressData: AddressDataDto;
}
