import { useQuery } from '@tanstack/react-query'
import { API } from '@shared/api/instance'
import { AxiosRequestConfig } from 'axios'
import { ProductType } from '@core/types/product-item'

export interface FetchProductsOptions {
  skip?: number
  limit?: number
}

interface ResponseType {
  items: ProductType[]
  pagination: {
    total: number
    limit: number
    skip: number
    hasMore: boolean
  }
}

const fetchProducts = async (options?: FetchProductsOptions) => {
  const config: AxiosRequestConfig = {
    params: {
      skip: options?.skip || 0,
      limit: options?.limit || 12,
    },
  }
  const response = await API.get<ResponseType>('/product', config)
  return response.data
}

export const useProducts = (options?: FetchProductsOptions) => {
  const query = useQuery({
    queryKey: ['products', options],
    queryFn: () => fetchProducts(options),
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    products: query.data,
    isProductsLoading: query.isLoading,
    productsError: query.error,
  }
}
