import { ProductFormType } from '@features/PostNewProducts'
import { API } from '@shared/api/instance'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const createOfferedProduct = async (body: ProductFormType) => {
  const response = await API.post('/offered-products', body)
  return response.data
}

export const useCreateOfferedProduct = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createOfferedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['offered-products'],
      })
    },
  })

  return {
    ...mutation,
    createOfferedProduct: mutation.mutateAsync,
  }
}
