import { API } from "@shared/api/instance"
import { StoreEditFormType } from "../types/storeEditTypes"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"

export const updateStore = async (data: StoreEditFormType) => {
    try {
        const body = {
            ...data,
            imageUrl: data.imageUrl
        }
        const response = await API.patch('/store/update', body)
        toast('Данные обновленны', { type: "success" })
        return response.data
    } catch (error) {
        toast((error as any).response.data.message, { type: "error" })
        throw error
    }
}

export const useUpdateStore = () => {
    const mutation = useMutation({
        mutationFn: (data: StoreEditFormType) => updateStore(data)
    })

    return {
        updateStore: mutation.mutateAsync,
        ...mutation,
    }
}
