import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '@/shared/api/API';
import { PickupPointBase } from "@core/types/pickup-point";

export const usePickupPoints = (storeId?: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery<PickupPointBase[]>({
    queryKey: ['pickupPoints', storeId],
    queryFn: async () => {
      const response = await API.post<PickupPointBase[]>('/pickup-points', { storeId });
      queryClient.invalidateQueries({ queryKey: ['delivery-times'] });
      return response.data;
    },
    enabled: !!storeId,
    retry: 2,
  });

  return {
    ...query,
    pickupPoints: query.data,
    isLoadingPickupPoint: query.isLoading
  }
};