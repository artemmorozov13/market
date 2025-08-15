import { API } from "@/shared/api/API"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const updateSelectedAddress = async (addressId: string) => {
    const response = await API.patch(`/addresses/selected/${addressId}`)
    return response.data
}

export const useUpdateSelectedAddress = () => {
    const queryClient = useQueryClient()

    const mutate = useMutation({
        mutationFn: updateSelectedAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['stores']
            })
        }
    })
    return {
        ...mutate,
        updateSelectedAddress: mutate.mutateAsync
    }
}