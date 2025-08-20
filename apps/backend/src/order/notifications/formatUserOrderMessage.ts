import { DeliveryArea, DeliveryTime, OrderedProductsEntity, OrderEntity, PickupPointEntity, StoreEntity } from "@core/entities";
import { DeliveryStrategyEnum } from "@core/enums";

export const formatUserOrderMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    deliveryArea: DeliveryArea | null,
    deliveryTime: DeliveryTime | null,
    store: StoreEntity
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

    // Calculate product totals (with discounts applied)
    const calculateDiscountedPrice = (price: number, discount: number | null) => {
        if (!discount || discount <= 0) return price;
        return price - (price * discount / 100);
    };

    const productsTotalWithoutDiscount = orderedProducts.reduce(
        (sum, p) => sum + (Number(p.product.price) * p.quantity), 
        0
    );
    
    const productsTotal = orderedProducts.reduce(
        (sum, p) => {
            const price = Number(p.product.price);
            const discount = p.product.discount ? Number(p.product.discount) : 0;
            const discountedPrice = calculateDiscountedPrice(price, discount);
            return sum + (discountedPrice * p.quantity);
        }, 
        0
    );

    // Determine delivery cost and description
    let deliveryCost = 0;
    let deliveryDescription = '';

    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        // Стоимость доставки рассчитывается без учета скидок на товары
        // Используем оригинальную стоимость товаров (без скидки) для проверки бесплатной доставки
        const originalProductsTotal = orderedProducts.reduce(
            (sum, p) => sum + (Number(p.product.price) * p.quantity), 
            0
        );
        
        deliveryCost = originalProductsTotal >= store.deliveryFreeFromLimit ? 0 : store.deliveryCost;
        deliveryDescription = 'Доставка до подъезда';
    } else if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        deliveryDescription = 'Самовывоз';
        deliveryCost = 0; // Самовывоз всегда бесплатный
    }

    // Итоговая сумма: товары со скидкой + доставка без скидки
    const totalAmount = productsTotal + deliveryCost;
    
    // Price formatter
    const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price).replace(',00', '');

    // Products list - showing original and discounted prices if applicable
    const productsList = orderedProducts.map(p => {
        const originalPrice = Number(p.product.price);
        const discount = p.product.discount ? Number(p.product.discount) : 0;
        const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
        
        if (discount > 0) {
            return `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ` +
                   `${formatPrice(discountedPrice)} (${discount}% скидка, было ${formatPrice(originalPrice)})`;
        } else {
            return `▪️ ${escape(p.product.name)} — ${escape(p.quantity.toString())} × ${formatPrice(originalPrice)}`;
        }
    }).join('\n');

    // Delivery/pickup details
    let deliveryDetails = '';
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        const pickupPoint = order.pickupPoint as PickupPointEntity;
        deliveryDetails = `
<b>📦 Самовывоз</b>
🏢 <b>Пункт выдачи:</b> ${escape(pickupPoint?.name || 'Не указан')}
📍 <b>Адрес:</b> ${escape(pickupPoint?.fullAddress || 'Не указан')}
        `;
    } else {
        deliveryDetails = `
<b>📦 Доставка</b>
📅 <b>Дата:</b> ${deliveryDate}
⏰ <b>Время:</b> ${startTime}–${endTime}
🚚 <b>Тип:</b> ${deliveryDescription}
🏠 <b>Адрес:</b> ${escape(order?.fullAddress || order?.address || 'Не указан')}
${deliveryCost > 0 ? `💰 <b>Стоимость доставки:</b> ${formatPrice(deliveryCost)}` : '💰 <b>Доставка:</b> Бесплатно'}
${store.deliveryFreeFromLimit > 0 ? `🎯 <b>Бесплатная доставка от:</b> ${formatPrice(store.deliveryFreeFromLimit)}` : ''}
        `;
    }

    // Calculate discount amount if any
    const discountAmount = productsTotalWithoutDiscount - productsTotal;
    const hasDiscount = discountAmount > 0;

    // Final message template
    return `
<b>🛍️ Заказ #${order.id} подтверждён!</b>

${deliveryDetails}

<b>🛒 Состав заказа</b>
${productsList}

<b>💳 Итого к оплате</b>
🛒 <b>Товары${hasDiscount ? ' (со скидкой)' : ''}:</b> ${formatPrice(productsTotal)}
${hasDiscount ? `🎁 <b>Скидка на товары:</b> -${formatPrice(discountAmount)}` : ''}
🚚 ${deliveryCost > 0 ? `<b>Доставка:</b> ${formatPrice(deliveryCost)}` : '<b>Доставка:</b> Бесплатно'}
💵 <b>Общая сумма:</b> ${formatPrice(totalAmount)}

📞 <b>По всем вопросам:</b> @${store.helpTelegramAccount}
    `.trim();
};