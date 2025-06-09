import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/shared/api/API";
import { Order } from "../types/activeOrderTypes";
import { toast } from "react-toastify";

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const query = useMutation({
    mutationFn: async (order: Partial<Order>) => {
      const body = {
        id: order.id,
        products: order.ordered_products?.map(product => ({
          productId: product.product.id,
          quantity: product.quantity
        })),
      }
      await API.post("/order/update-order", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeOrder"] });
    },
    onError: () => {
      toast("Ошибка при обновлении состава заказа", { type: "error" })
    }
  });

  return {
    ...query,
    updateOrder: query.mutateAsync
  }
};