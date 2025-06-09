import { API } from "../../../shared/api/instance"

export const fetchUser = async () => {
    try {
        const response = await API.get("/users")

        return response.data
    } catch {
        throw new Error()
    }
}