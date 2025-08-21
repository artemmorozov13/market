import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@shared/api/instance'
import { ProductType } from '@core/types/product-item'

const createProduct = async (data: ProductType) => {
  const body: ProductType = {
    ...data,
    image: (data.image as any).url,
  }
  const response = await API.post('/product', body)
  return response.data
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      })
    },
  })
  return {
    ...mutation,
    createProduct: mutation.mutateAsync,
  }
}
