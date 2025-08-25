// create-working-hours.dto.ts
import { WeekdayEnum } from "@core/enums/weekday.enum";
import { IsEnum, IsString } from "class-validator";

export class CreateWorkingHoursDto {
  @IsEnum(WeekdayEnum)
  dayOfWeek: WeekdayEnum;

  @IsString()
  openingTime: string;

  @IsString()
  closingTime: string;
}