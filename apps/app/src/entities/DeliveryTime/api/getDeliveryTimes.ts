import { API } from "@/shared/api/API";
import { useQuery } from "@tanstack/react-query";
import { DeliveryTimeBase } from "@core/types/delivery-time";

const fetchDeliveryTimes = async (pickupPointId: number): Promise<DeliveryTimeBase[]> => {
  const response = await API.get<DeliveryTimeBase[]>(`/pickup-points/${pickupPointId}/available-times`);
  return response.data;
};

export const useDeliveryTimes = (pickupPointId: number | null) => {
  const query = useQuery({
    queryKey: ['delivery-times', pickupPointId],
    queryFn: () => {
      if (!pickupPointId) return Promise.resolve([]);
      return fetchDeliveryTimes(pickupPointId);
    },
    enabled: !!pickupPointId,
  });

  return {
    ...query,
    deliveryTimeData: pickupPointId ? query.data : []
  };
};