import { API } from "@/shared/api/API"

export const fetchAddressListData = async () => {
    const response = await API.get("/addresses")

    return response.data
}