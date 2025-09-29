import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { PickupPoint } from "@core/entities/pickup-point.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";

const textByStatus: Record<OrderStatusEnum, string> = {
    waitForPay: "Создан",
    finished: "Завершен",
    canceled_by_user: 'Отменен',
    cancel_by_admin: 'Отменен Администратором',
    finished_and_rated: 'Заверешен и оценен'
}

export const formatUpdatedOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    pickupPoint?: PickupPoint | null,  // Делаем параметр опциональным
    deliveryTime?: DeliveryTime | null, // Делаем параметр опциональным
    changes?: string[]
): string => {
    const escape = (str: string | undefined | null) => 
        str ? str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        : '';

    const mskOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Moscow',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const deliveryDate = escape(new Date(order.deliveryDate).toLocaleDateString('ru-RU', mskOptions));
    const startTime = escape(deliveryTime?.startTime?.toString().slice(0, 5)); // Используем optional chaining
    const endTime = escape(deliveryTime?.endTime?.toString().slice(0, 5));     // Используем optional chaining
    const address = escape(order.fullAddress || order.address || 'Адрес не указан');
    const pickupName = escape(pickupPoint?.name || 'Пункт выдачи не указан');

    const productsTotal = orderedProducts.reduce(
        (sum, p) => {
            const price = Number(p.product?.price || 0);
            const quantity = Number(p.quantity || 0);
            return sum + (price * quantity);
        },
        0
    );
    const deliveryCost = productsTotal >= 4000 ? 0 : 100;
    const totalAmount = productsTotal + deliveryCost;

    const formatPrice = (price: number) => 
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
            .format(price)
            .replace(',00', '');

    const productsList = orderedProducts
        .map(p => `▪️ ${escape(p.product?.name)} — ${escape(p.quantity?.toString())} × ${formatPrice(Number(p.product?.price || 0))}`)
        .join('\n');

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