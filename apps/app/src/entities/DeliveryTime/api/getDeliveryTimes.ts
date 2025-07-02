import { API } from "@/shared/api/API";
import { useQuery } from "@tanstack/react-query";
import { DeliveryTimeBase } from "@core/types/delivery-time";

const fetchDeliveryTimes = async (deliveryAreaId: number): Promise<DeliveryTimeBase[]> => {
  const response = await API.get<DeliveryTimeBase[]>(`/delivery-areas/${deliveryAreaId}/available-times`);
  return response.data;
};

export const useDeliveryTimes = (deliveryAreaId?: number | null) => {
  const query = useQuery({
    queryKey: ['delivery-times', deliveryAreaId],
    queryFn: () => {
      if (!deliveryAreaId) return Promise.resolve([]);
      return fetchDeliveryTimes(deliveryAreaId);
    },
    enabled: !!deliveryAreaId,
  });

  return {
    ...query,
    deliveryTimeData: deliveryAreaId ? query.data : []
  };
};