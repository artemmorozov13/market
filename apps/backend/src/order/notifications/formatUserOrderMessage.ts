import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { DeliveryArea } from "@core/entities/delivery-area.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";
import { PickupPointEntity } from "@core/entities/pickup-point.entity";

const textByStatus: Record<OrderStatusEnum, string> = {
    waitForPay: "Создан",
    finished: "Завершен",
    canceled_by_user: 'Отменен',
    cancel_by_admin: 'Отменен Администратором',
    finished_and_rated: 'Заверешен и оценен'
};

export const formatUserOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    deliveryArea: DeliveryArea | null,
    deliveryTime: DeliveryTime | null
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

    // Format delivery date
    const deliveryDate = order.deliveryDate 
        ? escape(new Date(order.deliveryDate).toLocaleDateString('ru-RU', mskOptions))
        : 'Не указана';
    
    // Format delivery time
    const startTime = deliveryTime?.startTime?.toString()?.slice(0, 5) || 'Не указано';
    const endTime = deliveryTime?.endTime?.toString()?.slice(0, 5) || 'Не указано';

    // Calculate totals
    const productsTotal = orderedProducts.reduce((sum, p) => sum + (Number(p.product.price) * p.quantity), 0);
    
    // Determine delivery cost and description
    let deliveryCost = 0;
    let deliveryDescription = '';

    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        deliveryCost = productsTotal >= 4000 ? 0 : 100;
        deliveryDescription = 'Доставка до подъезда';
    } else if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        deliveryDescription = 'Самовывоз';
    }

    const totalAmount = productsTotal + deliveryCost;
    
    // Price formatter
    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price).replace(',00', '');

    // Products list
    const productsList = orderedProducts.map(p => 
        `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ${formatPrice(Number(p.product.price))}`
    ).join('\n');

    // Delivery/pickup details
    let deliveryDetails = '';
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        const pickupPoint = order.pickupPoint as PickupPointEntity;
        deliveryDetails = `
<b>📦 Самовывоз</b>
┌──────────────────────
│ 🏢 <b>Пункт выдачи:</b> ${escape(pickupPoint?.name || 'Не указан')}
│ 📍 <b>Адрес:</b> ${escape(pickupPoint?.fullAddress || 'Не указан')}
└──────────────────────
        `;
    } else {
        deliveryDetails = `
<b>📦 Доставка</b>
┌──────────────────────
│ 📅 <b>Дата:</b> ${deliveryDate}
│ ⏰ <b>Время:</b> ${startTime}–${endTime}
│ 🚚 <b>Тип:</b> ${deliveryDescription}
│ 🏠 <b>Адрес:</b> ${escape(order?.fullAddress || order?.address || 'Не указан')}
└──────────────────────
        `;
    }

    // Final message template
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