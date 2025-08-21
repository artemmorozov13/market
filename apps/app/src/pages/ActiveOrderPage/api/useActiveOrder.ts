import { useQuery } from '@tanstack/react-query'
import { API } from '@/shared/api/API'
import { Order } from '../types/activeOrderTypes'

export const useActiveOrder = () => {
  return useQuery<Order[]>({
    queryKey: ['activeOrder'],
    queryFn: async () => {
      const response = await API.get('/order/current')
      return response.data
    },
  })
}
