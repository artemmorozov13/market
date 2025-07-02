import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";
import { API } from "@shared/api/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StoreDeliveryStrategies } from "@core/types/delivery-strategies-type"

const addStoreStrategy = async (storeId: number, strategyId: number) => {
  const response = await API.post<StoreDeliveryStrategies>(
    `/delivery-strategies/stores/${storeId}`,
    { strategyId: strategyId }
  );
  return response.data;
};

export const useAddStoreStrategy = (storeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (strategyId: number) => addStoreStrategy(storeId, strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['store-strategies', storeId]
      });
    }
  });

  return {
    ...mutation,
    addStrategy: mutation.mutate,
    addStrategyAsync: mutation.mutateAsync
  };
};