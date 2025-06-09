import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { PickupPoint } from "@core/entities/pickup-point.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";

const textByStatus: Record<OrderStatusEnum, string> = {
    waitForPay: "Обновлен",
    finished: "Завершен",
    canceled_by_user: 'Отменен'
}

export const formatUpdatedOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    pickupPoint: PickupPoint,
    deliveryTime: DeliveryTime,
    changes?: string[] // Опционально: массив строк с описанием изменений (например, ["Статус изменен на 'В обработке'", "Добавлен новый товар"])
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
    const pickupName = escape(pickupPoint?.name || '');

    const productsTotal = orderedProducts.reduce((sum, p) => sum + (p.product.price * p.quantity), 0);
    const deliveryCost = productsTotal >= 4000 ? 0 : 100;
    const totalAmount = productsTotal + deliveryCost;

    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price).replace(',00', '');

    const productsList = orderedProducts.map(p => 
        `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ${formatPrice(p.product.price)}`
    ).join('\n');

    // Блок изменений (если они указаны)
    const changesBlock = changes?.length ? `
<b>🔄 Изменения в заказе:</b>
${changes.map(change => `• ${escape(change)}`).join('\n')}
    `.trim() : '';

    return `
<b>✉️ Заказ #${order.id} обновлён!</b>

${changesBlock}

<b>📦 Детали доставки</b>
┌──────────────────────
│ 📅 <b>Дата:</b> ${deliveryDate}
│ ⏰ <b>Время:</b> ${startTime}–${endTime}
│ 🏪 <b>Пункт выдачи:</b> ${pickupName}
│ 📍 <b>Адрес:</b> ${address}
└──────────────────────

<b>🛒 Состав заказа</b>
${productsList}

<b>💳 Итого к оплате</b>
┌──────────────────────
│ <b>Товары:</b> ${formatPrice(productsTotal)}
│ <b>Доставка:</b> ${deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}
│ <b>Общая сумма:</b> ${formatPrice(totalAmount)}
└──────────────────────

<b>ℹ️ Статус заказа:</b> ${escape(textByStatus[order.status])}

По всем вопросам обращаться @Evamiir1.
    `.trim();
};