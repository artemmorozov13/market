import { setSeederFactory } from "typeorm-extension";
import { ProductEntity } from "../entities/product.entity";
import { ProductStatusEnum, UnitOfMeasuresEnum } from "../enums";
import { customFaker } from "./main.factory";


export const ProductFactory = setSeederFactory(ProductEntity, () => {
    const product = new ProductEntity();

    

    const productTypes = [
        'Молоко', 'Хлеб', 'Яйца', 'Сахар', 'Мука',
        'Конфеты', 'Печенье', 'Сок', 'Вода', 'Сыр'
    ];
    const productAdjectives = [
        'Свежий', 'Натуральный', 'Домашний', 'Фермерский', 'Экологичный'
    ];
    
    product.name = `${customFaker.helpers.arrayElement(productAdjectives)} ${
        customFaker.helpers.arrayElement(productTypes)} ${
        customFaker.number.int({min:1,max:1000})}`;
    product.description = `Качественный продукт от производителя. ${
        customFaker.helpers.arrayElement([
            'Без консервантов.',
            'Срок годности 30 дней.',
            'Произведено в России.',
            'Соответствует ГОСТ.'
        ])}`;
    product.price = parseFloat(customFaker.commerce.price({ min: 100, max: 5000 }));
    product.discount = product.offeredPrice 
        ? parseFloat(((1 - product.offeredPrice / product.price) * 100).toFixed())
        : 0;
    product.image = customFaker.image.url();
    product.unitValue = customFaker.number.int({ min: 1, max: 10 });
    product.unitOfMeasurement = customFaker.helpers.arrayElement([
        UnitOfMeasuresEnum.GRAMS,
        UnitOfMeasuresEnum.KILOGRAMS,
        UnitOfMeasuresEnum.PIECES
    ]);
    product.status = ProductStatusEnum.Active; // Только активные товары
    product.canelComment = ''; // Пустой комментарий для активных товаров
    
    return product;
});