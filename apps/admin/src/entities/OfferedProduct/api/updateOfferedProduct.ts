import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@shared/api/instance'
import { ProductType } from '@core/types/product-item'

const updateOfferedProduct = async (data: ProductType) => {
  const response = await API.patch(`/offered-products/${data.id}`, data)
  return response.data
}

export const useUpdateOfferedProduct = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateOfferedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['offered-products'],
      })
    },
  })

  return {
    ...mutation,
    updateProduct: mutation.mutateAsync,
  }
}
