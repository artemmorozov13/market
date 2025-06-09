import { fetchProductsData } from "@entities/Product";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
    const query = useQuery({
      queryKey: ['products'],
      queryFn: () => fetchProductsData({}),
      staleTime: 5 * 60 * 1000, // 5 минут
    })
    return {
        ...query,
        productsData: query.data,
        isProductsLoading: query.isLoading,
        productsError: query.error
    }
};