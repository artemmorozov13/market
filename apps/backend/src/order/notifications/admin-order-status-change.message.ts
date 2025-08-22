import { OrderEntity } from "@core/entities/order.entity";
import { OrderStatusEnum } from "@core/enums";

const escapeHtml = (str: string = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const getStatusEmoji = (status: OrderStatusEnum): string => {
  //@ts-ignore
  const emojiMap: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.Created]: '📋',
    [OrderStatusEnum.WaitForPay]: '⏳',
    [OrderStatusEnum.Confirmed]: '✅',
    [OrderStatusEnum.Assembly]: '🔧',
    [OrderStatusEnum.ReadyForDelivery]: '📦',
    [OrderStatusEnum.TransferredToDelivery]: '🚚',
    [OrderStatusEnum.OnTheWay]: '🚗',
    [OrderStatusEnum.Finished]: '🎉',
    [OrderStatusEnum.CancelByAdmin]: '❌',
    [OrderStatusEnum.FinishedAndRated]: '⭐'
  };
  return emojiMap[status] || '📝';
};

const getStatusText = (status: OrderStatusEnum): string => {
  //@ts-ignore
  const statusTexts: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.Created]: 'создан',
    [OrderStatusEnum.WaitForPay]: 'ожидает оплаты',
    [OrderStatusEnum.Confirmed]: 'подтвержден',
    [OrderStatusEnum.Assembly]: 'в сборке',
    [OrderStatusEnum.ReadyForDelivery]: 'готов к выдаче',
    [OrderStatusEnum.TransferredToDelivery]: 'передан в доставку',
    [OrderStatusEnum.OnTheWay]: 'в пути',
    [OrderStatusEnum.Finished]: 'завершен',
    [OrderStatusEnum.CancelByAdmin]: 'отменен администратором',
    [OrderStatusEnum.FinishedAndRated]: 'завершен и оценен'
  };
  return statusTexts[status] || 'обновлен';
};

export const getOrderStatusUpdateMessage = (
  order: OrderEntity,
  status: OrderStatusEnum,
  cancelReason?: string
): string => {
  const emoji = getStatusEmoji(status);
  const statusText = getStatusText(status);
  
  let message = `
${emoji} <b>Заказ #${order.id} ${statusText}</b>

📊 <b>Текущий статус:</b> ${getStatusEmoji(status)} ${statusText}
  `.trim();

  if (status === OrderStatusEnum.CancelByAdmin && cancelReason) {
    message += `\n\n📝 <b>Причина отмены:</b>\n${escapeHtml(cancelReason)}`;
  }

  message += `\n\nВы можете отслеживать статус заказа в личном кабинете.`;

  return message;
};