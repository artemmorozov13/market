import { API } from "@/shared/api/API";
import { BasketType } from "../types/basketTypes";

export const fetchBasketListData = async (): Promise<BasketType[]> => {
    const response = await API.get<BasketType[]>("/basket");
    return response.data;
};

export const pushBasketItem = async (id: number): Promise<void> => {
    const body = {
        productId: id
    }
    await API.post("/basket/add-product", body);
};

export const removeBasketItem = async (id: number): Promise<void> => {
    const body = {
        productId: id
    }
    await API.post(`/basket/remove-product`, body);
};

export const clearBasketProduct = async (id: number) => {
    const body = {
        productId: id
    }
    await API.post(`/basket/reset-product`, body);
}
