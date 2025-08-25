import { API } from '@/shared/api/API'
import { ProductType } from '@core/types/product-item'
import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query'

export interface PaginatedStoresResponse {
  data: ProductType[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface StoreProductsOptions {
  storeId: number
  limit?: number
}

const fetchProductsByStoreId = async ({
  storeId,
  pageParam = 1,
  limit = 8,
}: StoreProductsOptions & { pageParam?: number }): Promise<PaginatedStoresResponse> => {
  const response = await API.get(`/product/store/${storeId}`, {
    params: { page: pageParam, limit },
  })
  return response.data
}

export const useStoreProductsInfinite = (options: StoreProductsOptions, queryOptions?: any) => {
  return useInfiniteQuery<PaginatedStoresResponse, Error>({
    queryKey: ['storeProducts', options.storeId],
    queryFn: ({ pageParam = 1 }) =>
      fetchProductsByStoreId({ ...options, pageParam: Number(pageParam) }),
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length < lastPage.meta.totalPages ? allPages.length + 1 : undefined
    },
    ...queryOptions,
  })
}
