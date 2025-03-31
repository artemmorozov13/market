import { API } from "@shared/api/instance";
import { ProductType } from "../types/productTypes";

export const editProduct = async (data: ProductType) => {
    try {
        const response = await API.patch(`/product/${data.id}`, data)
        return response.data
    } catch(error) {
        throw error
    }
}