import { toast } from 'react-toastify'
import { API } from '../../../shared/api/instance'
import { ProductFormType } from '../types/postNewProductTypes'
import { UseFormReset } from 'react-hook-form'

export interface PostNewProductOptions {
  body: ProductFormType
  reset: UseFormReset<ProductFormType>
}

export const postNewProduct = async (options: PostNewProductOptions) => {
  const { body, reset } = options

  try {
    const response = await API.post('/products', body)

    toast('Товар добавлен')
    reset()

    return response.data
  } catch {
    toast('Ошибка при добавлении')
    throw new Error()
  }
}
