import { API } from "@shared/api/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import { toast } from "react-toastify";

export interface UpdateOrderStatusParams {
  orderIds: number[];
  status: OrderStatusEnum;
  cancelReason?: string;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (options: UpdateOrderStatusParams) => {
      const { orderIds, status, cancelReason } = options;
      
      if (status === OrderStatusEnum.CancelByAdmin && !cancelReason) {
        toast("При отмене заказа необходимо указать причину", { type: "error" });
        throw new Error("При отмене заказа необходимо указать причину")
      }

      const response = await API.post('/order/update-status', {
        orderIds,
        status,
        cancelReason
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['current-orders'] });
    },
    onError: (error) => {
      console.error("Ошибка при обновлении статуса заказов:", error);
    }
  });

  return {
    ...mutation,
    updateOrderStatus: mutation.mutateAsync
  };
};