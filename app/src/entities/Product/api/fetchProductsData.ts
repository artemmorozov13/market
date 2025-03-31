import { useInfiniteQuery } from '@tanstack/react-query';
import { API } from "@/shared/api/API";
import { AxiosRequestConfig } from "axios";

export interface FetchProductsDataOptions {
  enabled: boolean
  take?: number;
  skip?: number;
}

export const fetchProductsData = async (options: FetchProductsDataOptions) => {
  try {
    const config: AxiosRequestConfig = {
        params: {
            skip: options?.skip,
            limit: options?.take,
        },
    }
    const response = await API.get(`/product`, config);

    return response.data;
  } catch(error) {
    console.log(error)
  }
};

export const usePagedProductsList = (options: FetchProductsDataOptions) => {
    const { enabled = true } = options;
  
    return useInfiniteQuery({
      queryKey: ['productsList', 'paged', options.take],
      queryFn: ({ pageParam = 0 }) =>
        fetchProductsData({
          skip: pageParam,
          take: options.take,
          enabled: options.enabled,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.hasMore) {
          return lastPage.pagination.skip + lastPage.pagination.limit;
        }
        return undefined;
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
      enabled: enabled,
    });
};
