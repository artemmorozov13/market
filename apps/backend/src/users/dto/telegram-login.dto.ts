import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  @IsOptional()
  initData?: string;

  @IsOptional()
  @IsNumber()
  storeId?: number
}