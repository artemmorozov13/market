import { OrderEntity } from "@core/entities/order.entity";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";

const textByStatus: Record<OrderStatusEnum, string> = {
    waitForPay: "Создан",
    finished: "Завершен",
    canceled_by_user: 'Отменен',
    cancel_by_admin: 'Отменен Администратором',
    finished_and_rated: 'Заверешен и оценен'
};

export const formatUpdatedOrderMessage = (order: OrderEntity, changes?: string[]): string => {
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

    // Форматирование даты и времени
    const deliveryDate = order.deliveryDate 
        ? escape(new Date(order.deliveryDate).toLocaleDateString('ru-RU', mskOptions))
        : 'Не указана';
    
    const startTime = order.deliveryTime?.startTime?.toString().slice(0, 5) || 'Не указано';
    const endTime = order.deliveryTime?.endTime?.toString().slice(0, 5) || 'Не указано';

    // Функция для расчета цены со скидкой
    const calculateDiscountedPrice = (price: number, discount: number | null) => {
        if (!discount || discount <= 0) return price;
        return price - (price * discount / 100);
    };

    // Расчет стоимости товаров
    const productsTotalWithoutDiscount = order.ordered_products.reduce(
        (sum, p) => sum + (Number(p.product?.price || 0) * Number(p.quantity || 0)),
        0
    );

    const productsTotal = order.ordered_products.reduce(
        (sum, p) => {
            const price = Number(p.product?.price || 0);
            const discount = p.product?.discount ? Number(p.product.discount) : 0;
            const discountedPrice = calculateDiscountedPrice(price, discount);
            return sum + (discountedPrice * Number(p.quantity || 0));
        },
        0
    );

    // Определение информации о доставке/самовывозе
    let deliveryInfo = '';
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        const pickupName = order.address?.replace('Самовывоз: ', '') || 'Не указан';
        const pickupAddress = order.fullAddress || 'Не указан';
        
        deliveryInfo = `
<b>📦 Самовывоз</b>
┌──────────────────────
│ 🏢 <b>Пункт выдачи:</b> ${escape(pickupName)}
│ 📍 <b>Адрес:</b> ${escape(pickupAddress)}
└──────────────────────
        `;
    } else {
        deliveryInfo = `
<b>📦 Доставка</b>
┌──────────────────────
│ 📅 <b>Дата:</b> ${deliveryDate}
│ ⏰ <b>Время:</b> ${startTime}–${endTime}
│ 🏠 <b>Адрес:</b> ${escape(order.fullAddress || order.address || 'Не указан')}
└──────────────────────
        `;
    }

    // Расчет стоимости доставки (учитываем сумму со скидкой)
    let deliveryCost = 0;
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        deliveryCost = productsTotal >= 4000 ? 0 : 100;
    }
    
    const totalAmount = productsTotal + deliveryCost;
    const discountAmount = productsTotalWithoutDiscount - productsTotal;
    const hasDiscount = discountAmount > 0;
    
    const formatPrice = (price: number) => 
        new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price).replace(',00', '');

    // Список товаров с учетом скидки
    const productsList = order.ordered_products
        .filter(p => p.product) // Фильтруем существующие продукты
        .map(p => {
            const price = Number(p.product?.price || 0);
            const discount = p.product?.discount ? Number(p.product.discount) : 0;
            const discountedPrice = calculateDiscountedPrice(price, discount);
            
            if (discount > 0) {
                return `▪️ ${escape(p.product?.name)} — ${p.quantity} × ` +
                       `${formatPrice(discountedPrice)} (${discount}% скидка, было ${formatPrice(price)})`;
            } else {
                return `▪️ ${escape(p.product?.name)} — ${p.quantity} × ${formatPrice(price)}`;
            }
        })
        .join('\n');

    // Блок изменений
    const changesBlock = changes?.length ? `
<b>🔄 Изменения в заказе:</b>
${changes.map(change => `• ${escape(change)}`).join('\n')}
    `.trim() : '';

    return `
<b>✉️ Заказ #${order.id} обновлён!</b>

${changesBlock}

${deliveryInfo}

<b>🛒 Состав заказа</b>
${productsList}

<b>💳 Итого к оплате</b>
┌──────────────────────
│ <b>Товары${hasDiscount ? ' (со скидкой)' : ''}:</b> ${formatPrice(productsTotal)}
${hasDiscount ? `│ <b>Скидка:</b> -${formatPrice(discountAmount)}` : ''}
│ <b>Доставка:</b> ${deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}
│ <b>Общая сумма:</b> ${formatPrice(totalAmount)}
└──────────────────────

<b>ℹ️ Статус заказа:</b> ${escape(textByStatus[order.status])}

По всем вопросам обращаться @${order.store.helpTelegramAccount}.
    `.trim();
};