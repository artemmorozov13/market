import { IsEmail, IsString } from "class-validator";

export class AuthWithPasswordDto {
    @IsString()
    @IsEmail()
    email: string

    @IsString()
    password: string
}
