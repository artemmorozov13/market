import * as yup from 'yup';

export const storeSchema = yup.object().shape({
  name: yup.string().required('Название магазина обязательно'),
  description: yup.string(),
  isDeliveryFree: yup.boolean(),
  deliveryCost: yup.number().when('isDeliveryFree', {
    is: false,
    then: (schema) => schema.required('Укажите стоимость доставки').min(0, 'Не может быть отрицательной'),
    otherwise: (schema) => schema.notRequired(),
  }),
  deliveryFreeFromLimit: yup.number().min(0, 'Не может быть отрицательной'),
  telegramBotToken: yup.string().nullable(),
});