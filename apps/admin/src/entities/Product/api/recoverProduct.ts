import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@shared/api/instance'

const recoverProduct = async (id: number) => {
  const response = await API.post(`/product/recover/${id}`)
  return response.data
}

export const useRecoverProduct = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: recoverProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      })
    },
  })

  return {
    ...mutation,
    recoverProduct: mutation.mutateAsync,
  }
}
