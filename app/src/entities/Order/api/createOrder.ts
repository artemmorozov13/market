import { OrderFormInputs } from "@/features/OrderForm/types/orderFormTypes"
import { API } from "@/shared/api/API"
import { toast } from "react-toastify"

export interface CreateOrderOptions {
    data: {
        contact: OrderFormInputs,
    }
}

export const createOrder = async (options: CreateOrderOptions) => {
    const { data } = options

    try {
        const body = {
            phoneNumber: data.contact.phone,
            address: data.contact.address,
            comment: data.contact.comment,
            pickupPointId: data.contact.pickupPointId,
            deliveryTimeId: data.contact.deliveryTimeId,
        }

        const response = await API.post("/order/create", body)

        toast("Заказ успешно создан!", { type: "success" })

        return response.data
    } catch {
        toast("Ошибка при создании заказа", { type: "error" })
        throw new Error()
    }
}
