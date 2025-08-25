import { StoreUserBaseType } from '@core/types/store-user'
import { API } from '@shared/api/instance'
import { useQuery } from '@tanstack/react-query'

export const getSuppliersList = async () => {
  const response = await API.get<StoreUserBaseType[]>('/store-user/vendor-list')
  return response.data
}

export const useSuppliersList = () => {
  const query = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliersList,
  })

  return {
    ...query,
    suppliers: query.data,
  }
}
