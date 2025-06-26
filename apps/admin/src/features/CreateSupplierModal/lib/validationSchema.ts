import * as yup from "yup";

export const createSupplierFormSchema = yup.object({
    email: yup.string()
        .required("Поле email обязательно для заполнения")
        .email("Введите корректный email адрес"),
    password: yup.string()
        .min(6, "Пароль должен содержать минимум 6 символов"),
});