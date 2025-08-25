import { API } from '@/shared/api/API'
import { BasketBaseType } from '@core/types/basket-tipe'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const pushBasketItem = async (productId: number) => {
  const response = await API.post<BasketBaseType>('/basket/add-product', { productId })
  return response.data
}

export const usePushBasketItem = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: pushBasketItem,
    onSuccess: () => {
      // Инвалидируем кэш корзины после успешного добавления
      queryClient.invalidateQueries({ queryKey: ['basket'] })
    },
    onError: (error) => {
      console.error('Error adding item to basket:', error)
    },
  })

  return {
    ...mutation,
    incrementQuantity: mutation.mutateAsync,
    isLoadingIncrement: mutation.isPending,
  }
}
