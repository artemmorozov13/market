import { API } from "@/shared/api/API"
import { useMutation } from "@tanstack/react-query"

const updateSelectedAddress = async (addressId: string) => {
    const response = await API.patch(`/addresses/selected/${addressId}`)
    return response.data
}

export const useUpdateSelectedAddress = () => {
    const mutate = useMutation({
        mutationFn: updateSelectedAddress
    })
    return {
        ...mutate,
        updateSelectedAddress: mutate.mutateAsync
    }
}