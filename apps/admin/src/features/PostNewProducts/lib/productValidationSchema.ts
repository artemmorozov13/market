import { UnitOfMeasuresEnum } from '@core/enums/units-of-measures'
import * as yup from 'yup'

const unitOfMeasuresValues = Object.values(UnitOfMeasuresEnum)

export const productSchema = yup.object().shape({
  name: yup.string().required('Название продукта обязательно'),
  description: yup.string().required('Описание продукта обязательно'),
  price: yup
    .number()
    .required('Цена продукта обязательна')
    .positive('Цена должна быть положительной'),
  discount: yup
    .number()
    .required('Скидка обязательна')
    .min(0, 'Скидка не может быть меньше 0')
    .max(100, 'Скидка не может быть больше 100'),
  unitOfMeasurement: yup
    .string()
    .oneOf(
      [...unitOfMeasuresValues],
      `Единица измерения должна быть ${unitOfMeasuresValues.join(',')}`,
    )
    .required('Единица измерения обязательна'),
})
