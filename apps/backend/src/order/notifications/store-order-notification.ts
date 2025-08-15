import { TelegramService } from "@app/telegram/telegram.service";
import { StoreEntity } from "@core/entities";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { UsersEntity } from "@core/entities/users.entity";
import { DeliveryStrategyEnum } from "@core/enums";
import { Logger } from '@nestjs/common';

const logger = new Logger('StoreNotification');

export const formatStoreNotificationMessage = (
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    user: UsersEntity
): string => {
    const escape = (str: string | undefined | null) => 
        str ? str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        : '';

    const formatPrice = (price: number) => 
        new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price).replace(',00', '');

    // Расчет суммы с учетом скидок и количества
    const productsTotal = orderedProducts.reduce((sum, p) => {
        const price = Number(p.product.price);
        const discount = p.product.discount || 0;
        const discountedPrice = price * (1 - discount / 100);
        return sum + (discountedPrice * p.quantity);
    }, 0);

    // Форматирование даты доставки
    // Форматирование даты доставки
    const formatDeliveryDate = (date: Date | string | undefined | null) => {
        if (!date) return '—';
        
        // Convert to Date if it's a string
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) return '—';
        
        return dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Информация о доставке
    let deliveryInfo = '';
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        deliveryInfo = `
<b>📦 Самовывоз</b>
┌──────────────────────
│ 🏢 <b>Пункт выдачи:</b> ${escape(order.pickupPoint?.name)}
│ 📍 <b>Адрес:</b> ${escape(order.pickupPoint?.fullAddress)}
└──────────────────────
        `;
    } else {
        const deliveryTime = order.deliveryTime 
            ? `${escape(order.deliveryTime.startTime?.toString().slice(0, 5))}–${escape(order.deliveryTime.endTime?.toString().slice(0, 5))}`
            : '—';
            
        deliveryInfo = `
<b>📦 Доставка</b>
┌──────────────────────
│ 📅 <b>Дата:</b> ${formatDeliveryDate(order.deliveryDate)}
│ ⏰ <b>Время:</b> ${deliveryTime}
│ 🏠 <b>Адрес:</b> ${escape(order.fullAddress || order.address)}
└──────────────────────
        `;
    }

    // Список товаров с учетом скидок
    const productsList = orderedProducts.map(p => {
        const price = Number(p.product.price);
        const discount = p.product.discount || 0;
        const discountedPrice = price * (1 - discount / 100);
        const totalPrice = discountedPrice * p.quantity;
        
        let productLine = `▪️ ${escape(p.product.name)} — ${p.quantity} × ${formatPrice(discountedPrice)}`;
        
        if (discount > 0) {
            productLine += ` (${discount}% скидка)`;
        }
        
        productLine += ` = ${formatPrice(totalPrice)}`;
        
        return productLine;
    }).join('\n');

    // Общее количество товаров
    const totalItemsCount = orderedProducts.reduce((sum, p) => sum + p.quantity, 0);

    return `
<b>🛒 НОВЫЙ ЗАКАЗ #${order.id}</b>

<b>👤 Клиент</b>
┌──────────────────────
│ <b>Имя:</b> ${escape(user.name)}
│ <b>Телефон:</b> ${escape(order.phoneNumber)}
│ <b>Комментарий:</b> ${escape(order.comment) || '—'}
└──────────────────────

${deliveryInfo}

<b>🛍️ Состав заказа (${totalItemsCount} ${getItemsWord(totalItemsCount)})</b>
${productsList}

<b>💰 Итого к оплате:</b> ${formatPrice(productsTotal)}
    `.trim();
};

// Функция для правильного склонения слова "товар"
function getItemsWord(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'товаров';
    }
    
    switch (lastDigit) {
        case 1: return 'товар';
        case 2:
        case 3:
        case 4: return 'товара';
        default: return 'товаров';
    }
}

export const sendStoreNotification = async (
    telegramService: TelegramService,
    store: StoreEntity,
    order: OrderEntity,
    orderedProducts: OrderedProductsEntity[],
    user: UsersEntity
): Promise<boolean> => {
    if (!store.telegramBotToken) {
        logger.warn(`Не настроен telegramBotToken для магазина ${store.id}`);
        return false;
    }

    try {
        const message = formatStoreNotificationMessage(order, orderedProducts, user);

        await telegramService.sendMessageToBotOwner(
            store.telegramBotToken,
            message
        );
        logger.log(`Уведомление о заказе #${order.id} отправлено владельцу бота магазина ${store.id}`);
        return true;
        
    } catch (error) {
        console.log(error)
        return false;
    }
};