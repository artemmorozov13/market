import { IsString } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  initData: string;
}