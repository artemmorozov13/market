import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateStoreDto {
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email не может быть пустым' })
    userEmail: string;

    @IsString({ message: 'Название магазина должно быть строкой' })
    @IsNotEmpty({ message: 'Название магазина не может быть пустым' })
    name: string;
    
    @IsString({ message: 'Описание должно быть строкой' })
    @IsNotEmpty({ message: 'Описание не может быть пустым' })
    description: string;

    @IsBoolean({ message: 'Параметр бесплатной доставки должен быть true или false' })
    @IsOptional()
    isDeliveryFree: boolean;

    @IsNumber({}, { message: 'Стоимость доставки должна быть числом' })
    @IsOptional()
    deliveryCost: number;

    @IsNumber({}, { message: 'Лимит для бесплатной доставки должен быть числом' })
    @IsOptional()
    deliveryFreeFromLimit: number;

    @IsString({ message: 'Токен Telegram бота должен быть строкой' })
    @IsOptional()
    telegramBotToken: string;

    @IsString({ message: 'Ссылка на логотип должна быть строкой' })
    @IsOptional()
    logoUrl: string;
}
