import { API } from "@/shared/api/API";
import { useQuery } from "@tanstack/react-query";
import { DeliveryTimeBase } from "@core/types/delivery-time"

export const useDeliveryTimes = (pickupPointId: number | null) => {
  const query = useQuery({
    queryKey: ['delivery-times', pickupPointId],
    queryFn: async () => {
      if (!pickupPointId) return [];
      
      const response = await API.get<DeliveryTimeBase[]>(`/pickup-points/${pickupPointId}/available-times`);
      return response.data;
    },
    enabled: !!pickupPointId
  });

  return {
    ...query,
    deliveryTimeData: query.data || []
  }
};