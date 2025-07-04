import * as yup from 'yup'

export const authValidationSchema: yup.ObjectSchema<any> = yup.object({
  email: yup
    .string()
    .required("Email обязателен")
    .min(3, "минимальная длинна Email 3"),
  password: yup
    .string()
    .required("Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов"),
})