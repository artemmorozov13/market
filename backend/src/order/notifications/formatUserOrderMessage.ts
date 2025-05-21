import { DeliveryTime } from "src/entities/delivery-time.entity";
import { OrderEntity } from "src/entities/order.entity";
import { OrderedProductsEntity } from "src/entities/ordered-products.entity";
import { PickupPoint } from "src/entities/pickup-point.entity";
import { StatusEnum } from "src/utils/constants";

const textByStatus: Record<StatusEnum, string> = {
    waitForPay: "Создан",
    finished: "Завершен",
    canceled_by_user: 'Отменен'
}

export const formatUserOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    pickupPoint: PickupPoint,
    deliveryTime: DeliveryTime
): string => {
    const escape = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Форматирование даты и времени с московским часовым поясом
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
    
    // Расчет общей стоимости товаров
    const productsTotal = orderedProducts.reduce((sum, p) => {
        return sum + (p.product.price * p.quantity);
    }, 0);
    
    // Форматирование стоимости в рублях
    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price).replace(',00', '');

    // Форматирование списка товаров
    const productsList = orderedProducts.map(p => 
        `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ${formatPrice(p.product.price)}`
    ).join('\n');

    return `
<b>🛍️ Заказ #${order.id} подтверждён!</b>

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
│ <b>Доставка:</b> ${formatPrice(100)}
│ <b>Общая сумма:</b> ${formatPrice(productsTotal + 100)}
└──────────────────────

<b>ℹ️ Статус заказа:</b> ${escape(textByStatus[order.status])}

По всем вопросам обращаться @leninskiyprospekt_fruit_express.
    `.trim();
};