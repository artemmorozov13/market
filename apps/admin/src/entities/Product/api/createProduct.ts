import { API } from "@shared/api/instance";
import { ProductType } from "../types/productTypes";

export const createProduct = async (data: ProductType) => {
    try {
        const response = await API.post("/product", data)
        return response.data
    } catch(error) {
        throw error
    }
}