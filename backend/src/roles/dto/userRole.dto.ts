import { IsString, Length } from "class-validator"

export class UserRoleDto {
    @IsString()
    @Length(4, 25)
    label: string
    @IsString()
    @Length(4, 25)
    value: string
}