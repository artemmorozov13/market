import { OrderFormInputs } from "@/features/OrderForm/types/orderFormTypes"
import { API } from "@/shared/api/API"
import { formatDateToYYYYMMDD } from "@/shared/helpers/formatDateToYYYYMMDD"
import { toast } from "react-toastify"

export interface CreateOrderOptions {
    data: OrderFormInputs
}

export const createOrder = async (options: CreateOrderOptions) => {
    const { data } = options

    try {
        const body = {
            phoneNumber: data.phone,
            fullAddress: data.address?.fullAddress,
            address: data.address?.id,
            comment: data.comment,
            pickupPointId: data.pickupPointId,
            deliveryTimeId: data.deliveryTimeId,
            deliveryDate: data.deliveryDate ? formatDateToYYYYMMDD(new Date(data.deliveryDate)) : null
        }

        const response = await API.post("/order/create", body)

        toast("Заказ успешно создан!", { type: "success" })

        return response.data
    } catch(error) {
        toast((error as any).response.data.message, { type: "error" })
        throw new Error()
    }
}
