import { fetchOrderData } from "@entities/Order/api/fetchOrderData";
import { useQuery } from "@tanstack/react-query";

export const useOrders = () => {
    const query = useQuery({
      queryKey: ['orders'],
      queryFn: () => fetchOrderData({}),
      staleTime: 5 * 60 * 1000, // 5 минут
    });
    return {
        ...query,
        ordersData: query.data,
        isOrdersLoading: query.isLoading,
        ordersError: query.error
    }
};