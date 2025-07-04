import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@shared/api/instance";
import { ProductType } from "@core/types/product-item";
import { toast } from "react-toastify";
import { AxiosResponse } from "axios";

const editProductFn = async (data: ProductType) => {
  const response = await API.patch(`/product/${data.id}`, data);
  return response.data;
};

export const useEditProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: editProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      });
      toast('Продукт успешно обновлен', { type: 'success' });
    },
    onError: (error) => {
      toast((error as any).response.data.message, { type: 'error' });
    }
  });

  return {
    ...mutation,
    updateProduct: mutation.mutateAsync
  }
};