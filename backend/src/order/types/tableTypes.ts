import { OrderedProductsEntity } from "src/entities/ordered-products.entity";
import { ProductEntity } from "src/entities/product.entity";

export interface TableOrder {
    id: number;
    address: string;
    fullAddress: string
    priority: number;
    deliveryTimeRange: string; // Изменил название для ясности
    pickupPointName: string; // Добавил информацию о пункте выдачи
    ordered_products: OrderedProductsEntity[];
    createdAt: Date;
    phone: string;
    customerName: string; // Добавил имя клиента
    deliveryDate: string,
    status: string;
    totalAmount: string; // Добавил общую сумму заказа
    comment?: string; // Добавил комментарий к заказу
}
