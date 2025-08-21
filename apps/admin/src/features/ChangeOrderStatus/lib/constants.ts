import { OrderStatusEnum } from '@core/enums/order-status-enum'

export const STATUS_OPTIONS = [
  {
    value: OrderStatusEnum.Confirmed,
    label: 'Подтвержден',
  },
  {
    value: OrderStatusEnum.Assembly,
    label: 'Готовится к отправке',
  },
  {
    value: OrderStatusEnum.ReadyForDelivery,
    label: 'Готов к отправке',
  },
  {
    value: OrderStatusEnum.TransferredToDelivery,
    label: 'Передан курьеру',
  },
  {
    value: OrderStatusEnum.OnTheWay,
    label: 'В пути',
  },
  {
    value: OrderStatusEnum.WaitForPay,
    label: 'Ожидает оплаты',
  },
  {
    value: OrderStatusEnum.Finished,
    label: 'Оплачен',
  },
  {
    value: OrderStatusEnum.CancelByAdmin,
    label: 'Отменен администратором',
  },
] as const