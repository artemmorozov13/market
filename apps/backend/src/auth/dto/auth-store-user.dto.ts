import { IsEmail, IsString } from "class-validator";

export class AuthStoreUserDto {
    @IsString()
    @IsEmail()
    email: string

    @IsString()
    password: string
}