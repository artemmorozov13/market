import { IsString } from "class-validator";

export class AuthViaTelegramDto {
    @IsString()
    initData: string
}