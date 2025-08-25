import { PickupPointFormData } from '@pages/AdminPages/PickPointPage/types/pickupPointPageType'
import { API } from '@shared/api/instance'

export const pickupPointsApi = {
  getPickupPoints: async () => {
    const response = await API.get(`/pickup-points`)
    return response.data
  },

  getPickupPointById: async (id: number) => {
    const response = await API.get(`/pickup-points/${id}`)
    return response.data
  },

  createPickupPoint: async (data: PickupPointFormData) => {
    const response = await API.post(`/pickup-points`, data)
    return response.data
  },

  updatePickupPoint: async (data: PickupPointFormData) => {
    const response = await API.put(`/pickup-points/${data.id}`, data)
    return response.data
  },

  deletePickupPoint: async (id: number) => {
    const response = await API.delete(`/pickup-points/${id}`)
    return response.data
  },
}
