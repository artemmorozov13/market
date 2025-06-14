import { IsOptional, IsString } from "class-validator";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class CreateUserDto {
    @IsString()
    email: string

    @IsString()
    @IsOptional()
    password?: string;

    @CreateDateColumn()
    @IsOptional()
    createdAt?: Date;

    @UpdateDateColumn()
    @IsOptional()
    updatedAt?: Date;
}