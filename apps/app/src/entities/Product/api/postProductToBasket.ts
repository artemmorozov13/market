import { API } from "@/shared/api/API";

export const postProductToBasket = async (productId: number) => {
    try {
      const response = await API.get(`/product/${productId}/add-product`);
  
      return response.data;
    } catch(error) {
      throw error
    }
  };