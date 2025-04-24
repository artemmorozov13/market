import { API } from "@shared/api/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    
    const query = useMutation({
      mutationFn: (orderId: number) => 
        API.post('/order/update-status', { orderId }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
    });
    return {
        ...query,
        updateOrderStatus: query.mutate
    }
};