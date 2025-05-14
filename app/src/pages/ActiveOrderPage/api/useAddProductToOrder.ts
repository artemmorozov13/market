import { useMutation } from "@tanstack/react-query";
import { API } from "@/shared/api/API";

interface AddProductToOrderParams {
  orderId: number;
  productId: number;
}

export const useAddProductToOrder = () => {
  return useMutation({
    mutationFn: async ({ orderId, productId }: AddProductToOrderParams) => {
      const response = await API.post(`/orders/${orderId}/products`, { productId });
      return response.data;
    },
  });
};

interface RemoveProductFromOrderParams {
  orderId: number;
  productId: number;
}

export const useRemoveProductFromOrder = () => {
  return useMutation({
    mutationFn: async ({ orderId, productId }: RemoveProductFromOrderParams) => {
      const response = await API.delete(`/orders/${orderId}/products/${productId}`);
      return response.data;
    },
  });
};