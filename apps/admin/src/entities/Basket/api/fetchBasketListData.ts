
import { BasketType } from "..";
import { API } from "../../../shared/api/instance";

export const fetchBasketListData = async (): Promise<BasketType[]> => {
    const response = await API.get("/basket");
    return response.data;
};

export const pushBasketItem = async (item: BasketType): Promise<void> => {
    await API.put("/basket", item);
};

export const removeBasketItem = async (id: number): Promise<void> => {
    await API.delete(`/basket/${id}`);
};
