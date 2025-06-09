import { API } from "@shared/api/instance"

export const recoverProduct = async (id: number) => {
    try {
        const response = await API.post(`/product/revover/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}