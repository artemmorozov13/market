import { API } from '@/shared/api/API'
import { BasketBaseType } from '@core/types/basket-tipe'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const removeBasketItem = async (productId: number) => {
  const response = await API.post<BasketBaseType>(`/basket/remove-product`, { productId })
  return response.data
}

export const useRemoveBasketItem = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: removeBasketItem,
    onSuccess: () => {
      // Инвалидируем кэш корзины после успешного удаления
      queryClient.invalidateQueries({ queryKey: ['basket'] })
    },
    onError: (error) => {
      console.error('Error removing item from basket:', error)
    },
  })

  return {
    ...mutation,
    decrementQuantity: mutation.mutateAsync,
    isLoadingDecrement: mutation.isPending,
  }
}
