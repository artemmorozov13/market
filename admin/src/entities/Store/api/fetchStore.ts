import { API } from "../../../shared/api/instance"

export const fetchStore = async () => {
    try {
        const response = await API.get('/store')

        return response.data
    } catch {
        throw new Error()
    }
}