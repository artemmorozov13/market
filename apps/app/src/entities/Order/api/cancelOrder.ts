import { API } from '@/shared/api/API'
import { UseMutateAsyncFunction, useMutation, UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'

interface CancelOrderParams {
  orderId: number
}

interface CancelOrderResponse {
  success: boolean
  message?: string
}

type UseCancelOrderReturn = UseMutationResult<CancelOrderResponse, Error, CancelOrderParams> & {
  cancelOrder: UseMutateAsyncFunction<CancelOrderResponse, Error, CancelOrderParams>
}

const cancelOrderRequest = async ({ orderId }: CancelOrderParams): Promise<CancelOrderResponse> => {
  try {
    const response = await API.patch(`/order/cancel`, { orderId })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order')
    }
    throw new Error('Failed to cancel order')
  }
}

export const useCancelOrder = (): UseCancelOrderReturn => {
  const mutation = useMutation<CancelOrderResponse, Error, CancelOrderParams>({
    mutationFn: cancelOrderRequest,
    mutationKey: ['cancelOrder'],
    onSuccess: () => {
      // Можно добавить дополнительные действия при успешной отмене
    },
    onError: () => {
      // Можно добавить обработку ошибок (например, показать toast)
    },
  })

  return {
    ...mutation,
    cancelOrder: mutation.mutateAsync,
  }
}
