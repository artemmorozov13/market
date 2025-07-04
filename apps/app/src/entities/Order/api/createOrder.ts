import { OrderFormInputs } from "@/features/OrderForm/types/orderFormTypes";
import { API } from "@/shared/api/API";
import { toast } from "react-toastify";
import { adaptOrderFormToDto } from "../lib/orderAdapter";

export const createOrder = async (formData: OrderFormInputs) => {
    try {
        const dto = adaptOrderFormToDto(formData);
        const response = await API.post("/order/create", dto);

        toast("Заказ успешно создан!", { type: "success" });
        return response.data;
    } catch(error) {
        toast((error as any).response?.data?.message || "Ошибка при создании заказа", { 
            type: "error" 
        });
        throw error;
    }
};
