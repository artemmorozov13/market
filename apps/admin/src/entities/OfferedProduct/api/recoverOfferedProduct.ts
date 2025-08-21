import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@shared/api/instance'

const recoverOfferedProduct = async (id: number) => {
  const response = await API.patch(`/offered-product/recover/${id}`)
  return response.data
}

export const useRecoverOfferedProduct = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: recoverOfferedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['offered-products'],
      })
    },
  })

  return {
    ...mutation,
    recoverProduct: mutation.mutateAsync,
  }
}
