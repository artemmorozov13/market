import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { AddressDataDto } from './address-data.dto';
import { Optional } from '@nestjs/common';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsString()
  @IsNotEmpty()
  entrance: string;

  @IsString()
  @IsOptional()
  floor: string;

  @IsString()
  @IsOptional()
  apartment: string;

  @IsString()
  @IsOptional()
  intercom: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  addressData: AddressDataDto;
}
