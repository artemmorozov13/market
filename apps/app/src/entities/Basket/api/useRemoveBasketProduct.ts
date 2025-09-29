import { API } from "@/shared/api/API";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const clearBasketProduct = async (productId: number) => {
    await API.post('/basket/reset-product', { productId });
};

export const useRemoveBasketProduct = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: clearBasketProduct,
    onSuccess: () => {
      // Инвалидируем кэш корзины после успешного удаления товара
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
    onError: (error) => {
      console.error('Error removing product from basket:', error);
    }
  });

  return {
    ...mutation,
    clearBasketProduct: mutation.mutateAsync
  }
};