import { FetchOrdersDataOptions, fetchOrderData } from "@entities/Order";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (options?: FetchOrdersDataOptions) => {
  const query = useQuery({
    queryKey: ['orders', options?.skip, options?.take],
    queryFn: () => fetchOrderData(options),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
  return {
      ...query,
      ordersData: query.data,
      isOrdersLoading: query.isLoading,
      ordersError: query.error
  }
};