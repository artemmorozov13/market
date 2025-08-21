import * as yup from 'yup'
import { OrderStatusEnum } from '@core/enums/order-status-enum'

export const changeStatusSchema = yup.object({
  status: yup
    .mixed<OrderStatusEnum>()
    .oneOf([
      OrderStatusEnum.Finished,
      OrderStatusEnum.CancelByAdmin,
      OrderStatusEnum.WaitForPay,
      OrderStatusEnum.Assembly,
      OrderStatusEnum.Confirmed,
      OrderStatusEnum.OnTheWay,
      OrderStatusEnum.ReadyForDelivery,
      OrderStatusEnum.TransferredToDelivery
    ])
    .required('Выберите статус')
    .typeError('Необходимо выбрать статус'),
  cancelReason: yup
    .string()
    .when('status', {
      is: (status: OrderStatusEnum) => status === OrderStatusEnum.CancelByAdmin,
      then: (schema) =>
        schema
          .required('Укажите причину отмены')
          .min(10, 'Минимум 10 символов')
          .max(500, 'Максимум 500 символов'),
      otherwise: (schema) => schema.notRequired().nullable(),
    })
    .nullable(),
})

export interface ChangeStatusFormValues {
  status: OrderStatusEnum | null
  cancelReason?: string
}
