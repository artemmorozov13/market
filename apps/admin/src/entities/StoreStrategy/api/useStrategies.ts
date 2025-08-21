import { DeliveryStrategy } from '@core/types/delivery-strategies-type'
import { API } from '@shared/api/instance'
import { useQuery } from '@tanstack/react-query'

const getStrategies = async () => {
  const response = await API.get<DeliveryStrategy[]>('/delivery-strategies')
  return response.data
}

export const useStrategies = () => {
  const query = useQuery({
    queryKey: ['strategies-list'],
    queryFn: getStrategies,
  })
  return {
    ...query,
    strategies: query.data,
  }
}
