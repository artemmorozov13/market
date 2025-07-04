import { API } from "@shared/api/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const removeStoreStrategy = async (storeId: number, strategyId: number) => {
  const response = await API.delete(
    `/delivery-strategies/stores/${storeId}/strategy/${strategyId}`
  );
  return response.data;
};

export const useRemoveStoreStrategy = (storeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (strategyId: number) => removeStoreStrategy(storeId, strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['store-strategies', storeId]
      });
    }
  });

  return {
    ...mutation,
    removeStrategy: mutation.mutate,
    removeStrategyAsync: mutation.mutateAsync
  };
};