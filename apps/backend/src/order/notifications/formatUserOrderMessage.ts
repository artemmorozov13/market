import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { DeliveryArea } from "@core/entities/delivery-area.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";


const textByStatus: Record<OrderStatusEnum, string> = {
    waitForPay: "Создан",
    finished: "Завершен",
    canceled_by_user: 'Отменен',
    cancel_by_admin: 'Отменен Администратором',
    finished_and_rated: 'Заверешен и оценен'
}

export const formatUserOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    deliveryArea: DeliveryArea,
    deliveryTime: DeliveryTime
): string => {
    const escape = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const mskOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Moscow',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const deliveryDate = escape(new Date(order.deliveryDate).toLocaleDateString('ru-RU', mskOptions));
    const startTime = escape(deliveryTime.startTime.toString().slice(0, 5));
    const endTime = escape(deliveryTime.endTime.toString().slice(0, 5));
    const address = escape(order.fullAddress || order.address);
    const pickupName = escape(deliveryArea?.name || '');
    
    const productsTotal = orderedProducts.reduce((sum, p) => sum + (p.product.price * p.quantity), 0);
    
    // Определяем стоимость доставки в зависимости от типа
    let deliveryCost = 0;
    let deliveryDescription = '';

    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        deliveryCost = productsTotal >= 4000 ? 0 : 100;
        deliveryDescription = 'Доставка до подъезда';
    } else if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        deliveryDescription = 'Самовывоз';
    }

    const totalAmount = productsTotal + deliveryCost;
    
    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price).replace(',00', '');

    const productsList = orderedProducts.map(p => 
        `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ${formatPrice(p.product.price)}`
    ).join('\n');

    // Формируем блок доставки в зависимости от типа
    const deliveryDetails = order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself
        ? `
    <b>📦 Самовывоз</b>
    ┌──────────────────────
    │ 📅 <b>Дата:</b> ${deliveryDate}
    │ ⏰ <b>Время:</b> ${startTime}–${endTime}
    │ 🏢 <b>Пункт выдачи:</b> ${pickupName}
    └──────────────────────
            `
            : `
    <b>📦 Доставка</b>
    ┌──────────────────────
    │ 📅 <b>Дата:</b> ${deliveryDate}
    │ ⏰ <b>Время:</b> ${startTime}–${endTime}
    │ 🏠 <b>Адрес:</b> ${address}
    │ 🚚 <b>Тип:</b> ${deliveryDescription}
    └──────────────────────
            `;

        return `
    <b>🛍️ Заказ #${order.id} подтверждён!</b>

    ${deliveryDetails}

    <b>🛒 Состав заказа</b>
    ${productsList}

    <b>💳 Итого к оплате</b>
    ┌──────────────────────
    │ <b>Товары:</b> ${formatPrice(productsTotal)}
    ${deliveryCost > 0 ? `│ <b>Доставка:</b> ${formatPrice(deliveryCost)}` : '│ <b>Доставка:</b> Бесплатно'}
    │ <b>Общая сумма:</b> ${formatPrice(totalAmount)}
    └──────────────────────

    <b>ℹ️ Статус заказа:</b> ${escape(textByStatus[order.status])}

    По всем вопросам обращаться @Evamiir1.
        `.trim();
};