import { API } from '@/shared/api/API'
import { BasketBaseType } from '@core/types/basket-tipe'
import { useQuery } from '@tanstack/react-query'
import {
  groupBasketData,
  calculateStoreStats,
  calculateBasketSummary,
  GroupedBasketItem,
  BasketSummary,
} from '../lib/basketCalculations'

export interface EnhancedBasketReturn {
  basket?: BasketBaseType[]
  groupedBasket: Record<number, GroupedBasketItem>
  summary: BasketSummary
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const fetchBasketListData = async (): Promise<BasketBaseType[]> => {
  const response = await API.get<BasketBaseType[]>('/basket')
  return response.data
}

export const useBasket = (): EnhancedBasketReturn => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['basket'],
    queryFn: fetchBasketListData,
  })

  // Группируем и вычисляем данные
  const groupedBasket = calculateStoreStats(groupBasketData(data))
  const summary = calculateBasketSummary(data, groupedBasket)

  return {
    basket: data,
    groupedBasket,
    summary,
    isLoading,
    isError,
    refetch,
  }
}
