import { API } from '@/shared/api/API'
import { StoreBaseType } from '@core/types/store-type'
import { useQuery } from '@tanstack/react-query'
import { data } from 'react-router'

export const fetchStoreDataById = async (storeId?: string | null) => {
  const response = await API.get<StoreBaseType>(`/store/${storeId}`)
  return response.data
}

export const useStore = (storeId?: string | null) => {
  const query = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => fetchStoreDataById(storeId),
    enabled: !!storeId,
  })
  return {
    ...query,
    store: query.data,
    isLoadingStore: query.isLoading,
  }
}
