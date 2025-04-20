import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/shared/api/API";
import { Order } from "../types/activeOrderTypes";

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Partial<Order>) => {
      await API.post("/order/update-order", order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeOrder"] });
    },
  });
};