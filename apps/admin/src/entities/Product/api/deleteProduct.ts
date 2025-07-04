import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@shared/api/instance";

const deleteProduct = async (id: number): Promise<void> => {
  await API.delete(`/product/${id}`);
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      });
    },
  });
  
  return {
    ...mutation,
    deleteProduct: mutation.mutateAsync
  }
};