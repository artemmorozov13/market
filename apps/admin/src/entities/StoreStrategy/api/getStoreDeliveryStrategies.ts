import { StoreDeliveryStrategies } from "@core/types/delivery-strategies-type";
import { API } from "@shared/api/instance";
import { useQuery } from "@tanstack/react-query";

const getStoreStrategies = async (storeId?: number) => {
    const response = await API.get<StoreDeliveryStrategies>(`/delivery-strategies/stores/${storeId}`)
    return response.data
}

export const useStoreDeliveryStrategies = (storeId?: number) => {
  const query = useQuery({
    queryKey: ['store-strategies', storeId],
    queryFn: () => getStoreStrategies(storeId),
    enabled: !!storeId
  })

  return {
    ...query,
    storeStrategies: query.data
  }
};