import * as yup from 'yup'

export const registerValidationSchema: yup.ObjectSchema<any> = yup.object({
  shopName: yup.string().required('Название магазина обязательно'),
  username: yup
    .string()
    .required('Имя пользователя обязательно')
    .min(4, 'Имя пользователя должно содержать минимум 4 символа'),
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  passwordRepeat: yup
    .string()
    .when('password', (password, field) =>
      password
        ? field
            .required('Подтверждение пароля обязательно')
            .oneOf([yup.ref('password')], 'Пароли не совпадают')
        : field,
    )
    .required('Подтверждение пароля обязательно 2'),
})
