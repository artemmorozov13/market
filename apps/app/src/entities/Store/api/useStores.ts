import { API } from '@/shared/api/API'
import { useQuery } from '@tanstack/react-query'
import { StoreBaseType } from '@core/types/store-type'

export interface PaginatedStoresResponse {
  data: StoreBaseType[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface UseStoresOptions {
  page?: number
  limit?: number
}

const fetchStoresData = async ({
  page = 1,
  limit = 10,
}: UseStoresOptions = {}): Promise<PaginatedStoresResponse> => {
  const response = await API.get('/store', {
    params: {
      page,
      limit,
    },
  })
  return response.data
}

export const useStores = (options?: UseStoresOptions) => {
  const { page = 1, limit = 10 } = options || {}

  const query = useQuery<PaginatedStoresResponse>({
    queryKey: ['stores', { page, limit }],
    queryFn: () => fetchStoresData({ page, limit }),
  })

  return {
    ...query,
    stores: query.data?.data || [],
    pagination: query.data?.meta || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    currentPage: page,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
