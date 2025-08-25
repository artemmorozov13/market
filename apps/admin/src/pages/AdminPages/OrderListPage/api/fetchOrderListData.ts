import { API } from '@shared/api/instance'

export const fetchOrderListData = async () => {
  try {
    const response = await API.get('/orders')

    return response.data.data
  } catch {
    throw new Error()
  }
}
