import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";

export interface TableOrder {
    id: number;
    address: string;
    fullAddress: string
    priority: number;
    deliveryTimeRange: string; // Изменил название для ясности
    deliveryAreaName: string; // Добавил информацию о пункте выдачи
    ordered_products: OrderedProductsEntity[];
    createdAt: Date;
    phone: string;
    customerName: string; // Добавил имя клиента
    deliveryDate: string,
    status: string;
    totalAmount: string; // Добавил общую сумму заказа
    comment?: string; // Добавил комментарий к заказу
}
