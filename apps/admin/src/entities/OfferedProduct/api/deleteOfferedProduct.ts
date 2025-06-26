import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@shared/api/instance";

const deleteOfferedProduct = async (id: number): Promise<void> => {
  await API.delete(`/offered-products/${id}`);
};

export const useDeleteOfferedProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteOfferedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['offered-products'] 
      });
    },
  });
  
  return {
    ...mutation,
    deleteOfferedProduct: mutation.mutateAsync
  }
};