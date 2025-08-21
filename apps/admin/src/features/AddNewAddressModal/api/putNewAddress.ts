import { api } from '@shared/api/notAuthInstance'
import { AddressFormSchema } from '../types/addressesTypes'

export const putNewAddress = async (address: AddressFormSchema) => {
  try {
    const response = await api.post('/addresses', address)
    return response
  } catch (error) {
    return true
  }
}
