import { Transform } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class DeleteParamsDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    vendorId: number;
}
