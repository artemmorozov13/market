import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  initData: string;

  @IsOptional()
  @IsNumber()
  storeId: number
}