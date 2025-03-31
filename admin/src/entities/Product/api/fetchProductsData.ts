import { API } from "@shared/api/instance";
import { useQuery } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";
import { ProductType } from "../types/productTypes";

export interface FetchProductsDataOptions {
  take?: number;
  skip?: number;
}

interface ResponseType {
  items: ProductType[]
  pagination: {
    total: number,
    limit: number,
    skip: number,
    hasMore: boolean
}
}

export const fetchProductsData = async (options: FetchProductsDataOptions) => {
  try {
    const config: AxiosRequestConfig = {
      params: {
        skip: options?.skip,
        limit: options?.take,
      },
    };
    const response = await API.get<ResponseType>(`/product`, config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// export const useProductsList = (options?: FetchProductsDataOptions) => {
//   return useQuery({
//     queryKey: ['productsList', 'paged', options?.take, options?.page],
//     queryFn: () =>
//       fetchProductsData({
//         skip: options?.skip,
//         take: options?.take,
//         page: options?.page,
//         enabled: !!options?.enabled,
//       }),
//     staleTime: 0,
//     retry: 2,
//     enabled: options?.enabled,
//   });
// };