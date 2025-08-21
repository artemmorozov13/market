import * as yup from 'yup'

export const orderFormSchema = yup.object({
  address: yup.string().required('Address is required'),
  time: yup.string().required('Delivery time is required'),
  phone: yup
    .string()
    .matches(
      /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
      'Enter a valid Russian phone number in the format +7 (XXX) XXX-XX-XX',
    )
    .required('Phone number is required'),
})
