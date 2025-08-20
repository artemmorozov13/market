import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStoreDto {
    @IsNumber()
    id: number

    @IsString()
    name: string

    @IsString()
    @IsOptional()
    helpTelegramAccount: string | null
    
    @IsString()
    description: string

    @IsBoolean()
    isDeliveryFree: boolean

    @IsBoolean()
    isWorkWithPartners: boolean

    @IsNumber()
    deliveryCost: number

    @IsString()
    @IsOptional()
    imageUrl?: string

    @IsNumber()
    deliveryFreeFromLimit: number

    @IsString()
    @IsOptional()
    telegramBotToken: string

    @IsString()
    @IsOptional()
    logoUrl: string
}