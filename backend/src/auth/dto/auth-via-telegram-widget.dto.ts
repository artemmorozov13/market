import { IsString } from "class-validator";

export class LoginViaInitDataDto {
    @IsString()
    initData: string
}