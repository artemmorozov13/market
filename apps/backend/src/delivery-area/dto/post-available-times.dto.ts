import { IsString } from "class-validator";

export class PostAvailableTimesDto {
    @IsString()
    storeId: string
}