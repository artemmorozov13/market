import { IsString } from "class-validator";
import { TelegramAuthData } from "src/telegram/types/telegram-user-types";

export class LoginViaInitDataDto {
    @IsString()
    initData: TelegramAuthData
}