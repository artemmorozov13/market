import { IsEmail, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateUserBodyDto {
    @IsString()
    @IsOptional()
    name: string

    @IsString()
    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @IsOptional()
    phone_number: string
    
    @IsNumber()
    @IsPositive()
    @IsOptional()
    age: number

    @IsString()
    @IsOptional()
    password: string

    @IsOptional()
    @IsString()
    storeId?: string
}