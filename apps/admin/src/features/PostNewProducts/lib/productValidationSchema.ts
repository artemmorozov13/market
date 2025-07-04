import * as yup from 'yup';

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .required('Название продукта обязательно'),
  description: yup
    .string()
    .required('Описание продукта обязательно'),
  price: yup
    .number()
    .required('Цена продукта обязательна')
    .positive('Цена должна быть положительной'),
  discount: yup
    .number()
    .required('Скидка обязательна')
    .min(0, 'Скидка не может быть меньше 0')
    .max(100, 'Скидка не может быть больше 100'),
  image: yup
    .string()
    .required('Ссылка на изображение обязательна'),
  unitOfMeasurement: yup
    .string()
    .oneOf(['гр', 'кг', 'шт'], 'Единица измерения должна быть "гр" или "кг"')
    .required('Единица измерения обязательна'),
});