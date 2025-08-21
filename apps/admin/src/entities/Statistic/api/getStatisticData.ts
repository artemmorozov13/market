import { API } from '@shared/api/instance'
import { useQuery } from '@tanstack/react-query'

const getStatisticData = async () => {
  const response = await API.get('/statistic/orders')
  return response.data
}

export const useOrderStatistic = () => {
  const query = useQuery({
    queryKey: ['order-statistic'],
    queryFn: getStatisticData,
  })

  return {
    ...query,
    orderStatistic: query.data,
  }
}
