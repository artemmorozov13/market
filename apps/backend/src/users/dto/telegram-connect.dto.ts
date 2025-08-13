import { TelegramAuthData } from '@app/telegram/types/telegram-user-types';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TelegramLoginDto implements TelegramAuthData {
  @IsNumber()
  auth_date: number;

  @IsString()
  first_name: string;

  @IsString()
  hash: string;

  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsNumber()
  @IsOptional()
  storeId?: number
}