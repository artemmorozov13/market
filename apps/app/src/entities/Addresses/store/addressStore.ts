import { AddressType } from '@core/types/address-type'
import { makeAutoObservable } from 'mobx'

export class AddressStore {
  formData: Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'> = {
    fullAddress: '',
    entrance: '',
    floor: '',
    apartment: '',
    latitude: '',
    longitude: '',
    intercom: '',
    comment: null,
    postal_code: '',
    fias_id: '',
    geo_lat: '',
    geo_lon: '',
  }

  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  setFormField = <K extends keyof typeof this.formData>(
    field: K,
    value: (typeof this.formData)[K],
  ) => {
    this.formData[field] = value
  }

  resetForm = () => {
    this.formData = {
      fullAddress: '',
      entrance: '',
      floor: '',
      apartment: '',
      latitude: '',
      longitude: '',
      intercom: '',
      comment: null,
      postal_code: '',
      fias_id: '',
      geo_lat: '',
      geo_lon: '',
    }
    this.error = null
  }

  handleSubmit = async (): Promise<boolean> => {
    try {
      this.loading = true
      this.error = null

      // Здесь должна быть логика API вызова для создания адреса
      // const response = await api.createAddress(this.formData);

      // Временная заглушка для демонстрации
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return true
    } catch (err) {
      this.error = 'Ошибка при сохранении адреса'
      return false
    } finally {
      this.loading = false
    }
  }
}

export const addressStore = new AddressStore()
