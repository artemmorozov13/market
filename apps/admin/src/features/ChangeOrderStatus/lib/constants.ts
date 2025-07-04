import { OrderStatusEnum } from "@core/enums/order-status-enum";

export const STATUS_OPTIONS = [
  {
    value: OrderStatusEnum.Finished,
    label: "Оплачен",
  },
  {
    value: OrderStatusEnum.CancelByAdmin,
    label: "Отменен администратором",
  },
] as const;