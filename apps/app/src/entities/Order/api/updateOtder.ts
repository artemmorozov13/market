import { Order } from '@/pages/ActiveOrderPage/types/activeOrderTypes'
import { API } from '@/shared/api/API'
import { toast } from 'react-toastify'

export interface UpdateOrderOptions {
  orderId: number
  data: Order
}

export const updateOrder = async (options: UpdateOrderOptions) => {
  const { orderId, data } = options

  try {
    const body = {
      id: orderId,
      products: data.ordered_products?.map((product) => ({
        productId: product.product.id,
        quantity: product.quantity,
      })),
    }

    const response = await API.put(`/order/update`, body)

    toast('Заказ успешно обновлен!', { type: 'success' })

    return response.data
  } catch (error) {
    console.error(error)
    toast((error as any).response?.data?.message || 'Произошла ошибка при обновлении заказа', {
      type: 'error',
    })
    throw error
  }
}
