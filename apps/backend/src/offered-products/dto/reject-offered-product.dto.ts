import { IsOptional, IsString } from "class-validator";

export class RejectOfferedProductDto {
    @IsString()
    @IsOptional()
    comment?: string
}