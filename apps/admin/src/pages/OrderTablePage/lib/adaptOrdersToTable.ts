import { OrderStatusEnum } from "@core/enums/order-status-enum";
import { OrderType, OrderedProductType } from "@entities/Order";
import { ProductType } from "@entities/Product";

export interface TableOrder {
  id: number;
  address: string;
  fullAddress: string
  priority: number;
  deliveryTimeRange: string; // Изменил название для ясности
  pickupPointName: string; // Добавил информацию о пункте выдачи
  ordered_products: OrderedProductType[];
  createdAt: Date;
  phone: string;
  customerName: string; // Добавил имя клиента
  deliveryDate: string,
  status: OrderStatusEnum;
  totalAmount: string; // Добавил общую сумму заказа
  comment?: string; // Добавил комментарий к заказу
}

export const adaptOrdersToTable = (orders: OrderType[]): TableOrder[] => {
  return orders.map(order => {
    const deliveryTimeRange = order.deliveryTime 
      ? `${order.deliveryTime.startTime}-${order.deliveryTime.endTime}`
      : 'не указано';

    const pickupPointName = order.pickupPoint?.name || 'не указан';

    return {
      id: order.id,
      address: order.address,
      fullAddress: order.fullAddress,
      createdAt: order.createdAt,
      status: order.status,
      priority: calculatePriority(order),
      deliveryTimeRange,
      pickupPointName,
      phone: order.phoneNumber || 'не указан',
      ordered_products: order.ordered_products,
      customerName: order.user?.name || order.user?.telegram_username || 'не указан',
      deliveryDate: order.deliveryDate,
      totalAmount: order.totalAmount,
      comment: order.comment
    };
  });
};

const calculatePriority = (order: OrderType): number => {
  if (order.status === 'waitForPay') return 1;
  if (order.status === 'finished') return 2;
  return 3;
};