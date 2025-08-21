import { API } from '@/shared/api/API'
import { AddressType } from '@core/types/address-type'
import { useQuery } from '@tanstack/react-query'

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
    queryFn: () => fetchAddressById(addressId),
  })

  return {
    ...qyery,
    address: qyery.data,
  }
}
