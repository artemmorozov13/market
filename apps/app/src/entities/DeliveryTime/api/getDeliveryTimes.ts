import { API } from "@/shared/api/API";
import { useQuery } from "@tanstack/react-query";
import { DeliveryTimeBase } from "@core/types/delivery-time";

export interface GetDeliveryTimesBody {
  storeId: string;
}

const fetchDeliveryTimes = async (deliveryAreaId: number, body: GetDeliveryTimesBody): Promise<DeliveryTimeBase[]> => {
  const response = await API.post<DeliveryTimeBase[]>(
    `/delivery-areas/${deliveryAreaId}/available-times`,
    body
  );
  return response.data;
};

export const useDeliveryTimes = (deliveryAreaId?: number | null, storeId?: string | null) => {
  const query = useQuery({
    queryKey: ['delivery-times', deliveryAreaId, storeId],
    queryFn: () => {
      if (!deliveryAreaId || !storeId) return Promise.resolve([]);
      
      const body: GetDeliveryTimesBody = {
        storeId: storeId
      };
      
      return fetchDeliveryTimes(deliveryAreaId, body);
    },
    enabled: !!deliveryAreaId && !!storeId,
  });

  return {
    ...query,
    deliveryTimeData: query.data || [],
  };
};