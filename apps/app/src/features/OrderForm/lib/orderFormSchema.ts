import * as yup from "yup";

export const getOrderFormSchema = (deliveryMethod: string | null) => {
  const baseSchema = {
    phone: yup
      .string()
      .matches(
        /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
        "Введите номер в формате +7 (XXX) XXX-XX-XX"
      )
      .required("Укажите телефон для связи"),
    comment: yup.string(),
  };

  if (deliveryMethod === "delivery") {
    return yup.object({
      ...baseSchema,
      addressId: yup.number().required("Укажите адрес доставки"),
      deliveryAreaId: yup.number().required("Выберите зону доставки"),
      deliveryTimeId: yup.number().required("Выберите время доставки"),
    });
  }

  if (deliveryMethod === "pickup") {
    return yup.object({
      ...baseSchema,
      pickupPointId: yup.number().required("Выберите пункт самовывоза"),
    });
  }

  return yup.object(baseSchema);
};