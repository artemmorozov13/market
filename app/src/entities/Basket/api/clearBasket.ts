import { API } from "@/shared/api/API"

export const postClearBasket = async () => {
    try {
        const response = await API.post(`/basket/clear`)
        return response.data
    } catch (error) {
        throw error
    }
}