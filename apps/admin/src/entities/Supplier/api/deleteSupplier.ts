import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@shared/api/instance";

export const deleteSupplier = async (vendorId: number) => {
  const response = await API.delete(`/store-user/vendor/${vendorId}`);
  return response.data;
};

export const useDeleteSupplier = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers']
      });
      onSuccess?.();
    },
  });

  return {
    ...mutation,
    deleteSupplier: mutation.mutateAsync
  }
};