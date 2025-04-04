import { API } from "@shared/api/instance";

export const deleteProduct = async (id: number): Promise<void> => {
    const response = await API.delete(`/product/${id}`);
    return response.data;
};


