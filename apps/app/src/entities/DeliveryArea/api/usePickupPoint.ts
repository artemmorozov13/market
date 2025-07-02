import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '@/shared/api/API';
import { DeliveryAreaBase } from '@core/types/delivery-area-type';

export const useDeliveryAreas = (storeId?: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery<DeliveryAreaBase[]>({
    queryKey: ['deliveryAreas', storeId],
    queryFn: async () => {
      const response = await API.post<DeliveryAreaBase[]>('/delivery-areas', { storeId });
      queryClient.invalidateQueries({ queryKey: ['delivery-times'] });
      return response.data;
    },
    enabled: !!storeId,
    retry: 2,
  });

  return {
    ...query,
    deliveryAreas: query.data,
    isLoadingDeliveryArea: query.isLoading
  }
};