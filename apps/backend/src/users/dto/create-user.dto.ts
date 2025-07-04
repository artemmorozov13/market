import { IsEmail, IsNumber, IsPositive, IsString } from "class-validator"

export class CreateUserBodyDto {
    @IsString()
    name: string

    @IsString()
    @IsEmail()
    email: string

    @IsString()
    phone_number: string
    
    @IsNumber()
    @IsPositive()
    age: number

    @IsString()
    password: string

    @IsNumber()
    @IsPositive()
    telegram_id: number

    @IsString()
    telegram_username: string
}