import { API } from "@/shared/api/API"
import { useQuery } from "@tanstack/react-query"
import { AddressType } from ".."

interface AddressByIdQueryOptions {
    addressId: string
}

const fetchAddressById = async (addressId: string): Promise<AddressType> => {
    const response = await API.get(`/addresses/${addressId}`)

    return response.data
}

export const useAddressById = (options: AddressByIdQueryOptions) => {
    const { addressId } = options

    const qyery = useQuery({
        queryKey: ['addressById'],
        queryFn: () => fetchAddressById(addressId)
    })

    return {
        ...qyery,
        address: qyery.data
    }
}