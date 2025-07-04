import { IsOptional, IsString, IsEmail, IsInt, Min, Max, IsPhoneNumber, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsPhoneNumber() // или кастомный декоратор для формата телефона
  phone_number?: string;
}