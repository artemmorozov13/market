import { OrderEntity } from "@core/entities/order.entity";

const escapeHtml = (str: string = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const getCanceledByAdminMessage = (
  order: OrderEntity,
  cancelReason?: string
): string => {
  return `
<b>❌ Заказ #${order.id} отменен администратором</b>

📝 <b>Причина отмены:</b>
${escapeHtml(cancelReason || 'Не указана')}

Вы можете создать новый заказ или обратиться за помощью.
  `.trim();
};