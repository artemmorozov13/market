import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { AddressData } from '../types/addressesTypes';
import { AddressDataDto } from './address-data.dto';

export class UpdateAddressDto {
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
  addressData: AddressDataDto;
}