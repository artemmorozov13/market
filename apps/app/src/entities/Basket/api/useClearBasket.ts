import { API } from "@/shared/api/API"
import { useMutation, useQueryClient } from "@tanstack/react-query";

const clearBasket = async () => {
    const response = await API.post(`/basket/clear`)
    return response.data
}

export const useClearBasket = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<void, Error>({
    mutationFn: clearBasket,
    onSuccess: () => {
      // Инвалидируем кэш корзины, что вызовет новый запрос
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    }
  });

  return {
    ...mutation,
    clearBasket: mutation.mutateAsync
  }
};