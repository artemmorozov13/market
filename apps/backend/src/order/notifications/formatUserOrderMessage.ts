import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { DeliveryArea } from "@core/entities/delivery-area.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";


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
    const pickupName = escape(deliveryArea?.name || '');
    
    // Расчет общей стоимости товаров
    const productsTotal = orderedProducts.reduce((sum, p) => {
        return sum + (p.product.price * p.quantity);
    }, 0);
    
    // Бесплатная доставка для заказов от 4000 рублей
    const deliveryCost = productsTotal >= 4000 ? 0 : 100;
    const totalAmount = productsTotal + deliveryCost;
    
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
│ <b>Доставка:</b> ${deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}
│ <b>Общая сумма:</b> ${formatPrice(totalAmount)}
└──────────────────────

<b>ℹ️ Статус заказа:</b> ${escape(textByStatus[order.status])}

По всем вопросам обращаться @Evamiir1.
    `.trim();
};