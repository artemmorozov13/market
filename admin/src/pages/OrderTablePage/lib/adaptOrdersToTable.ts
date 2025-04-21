import { OrderType } from "@entities/Order";
import { ProductType } from "@entities/Product";

export interface TableOrder {
  id: number;
  address: string;
  fullAddress: string
  priority: number;
  deliveryTimeRange: string; // Изменил название для ясности
  pickupPointName: string; // Добавил информацию о пункте выдачи
  createdAt: Date;
  phone: string;
  customerName: string; // Добавил имя клиента
  deliveryDate: string,
  status: string;
  totalAmount: number; // Добавил общую сумму заказа
  products: Record<number, number>; // productId -> quantity
  comment?: string; // Добавил комментарий к заказу
}

export const adaptOrdersToTable = (
  orders: OrderType[],
  allProducts: ProductType[]
): TableOrder[] => {
  return orders.map(order => {
    // Создаем маппинг productId -> quantity для этого заказа
    const productsMap: Record<number, number> = {};
    let totalAmount = 0;

    order.ordered_products?.forEach(op => {
      if (op.product) {
        productsMap[op.product.id] = op.quantity;
        totalAmount += Number(op.product.price) * op.quantity;
      }
    });

    // Форматируем время доставки
    const deliveryTimeRange = order.deliveryTime 
      ? `${order.deliveryTime.startTime}-${order.deliveryTime.endTime}`
      : 'не указано';

    // Получаем информацию о пункте выдачи
    const pickupPointName = order.pickupPoint?.name || 'не указан';

    return {
      id: order.id,
      address: order.address,
      fullAddress: order.fullAddress,
      createdAt: order.created_at,
      status: order.status,
      priority: calculatePriority(order),
      deliveryTimeRange,
      pickupPointName,
      phone: order.phoneNumber || 'не указан',
      customerName: order.user?.name || order.user?.telegram_username || 'не указан',
      deliveryDate: order.deliveryDate,
      totalAmount,
      products: productsMap,
      comment: order.comment
    };
  });
};

const calculatePriority = (order: OrderType): number => {
  // Пример логики: срочные заказы получают более высокий приоритет
  if (order.status === 'waitForPay') return 1;
  if (order.status === 'finished') return 2;
  return 3; // для 'finished' и других статусов
};