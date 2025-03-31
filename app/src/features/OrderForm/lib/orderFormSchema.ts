import * as yup from "yup";

export const orderFormSchema = yup.object({
  address: yup.string().required("Укажите адрес доставки"),
  phone: yup
    .string()
    .matches(
      /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
      "Введите номер в формате +7 (XXX) XXX-XX-XX"
    )
    .required("Укажите телефон для связи"),
  comment: yup.string(),
  pickupPointId: yup.number().required("Выберите пункт выдачи"),
  deliveryTimeId: yup.number().required("Выберите время доставки"),
});