import { API } from "../../../shared/api/instance"

export const fetchAddressListData = async () => {
    const response = await API.get("/addresses")

    return response.data
}