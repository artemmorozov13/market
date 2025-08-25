import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API } from '@shared/api/instance'
import { dayOptions } from '@pages/AdminPages/DeliveryAreasPage/consts/intervals'
import { DeliveryArea, DeliveryAreaForm, DeliveryAreaResponse } from '../types/pickupPointTypes'
import { toast } from 'react-toastify'
import { WeekdayEnum } from '@core/enums/weekday.enum'

// Типы для параметров запросов
interface FetchDeliveryAreasOptions {
  storeId?: number
}

interface CreateDeliveryAreaData extends DeliveryAreaForm {}

interface UpdateDeliveryAreaData extends CreateDeliveryAreaData {
  id: number
}

const formatDeliveryAreaData = (area: DeliveryAreaResponse): DeliveryArea => {
  // Определяем порядок сортировки дней недели с правильной типизацией
  const weekdayOrder: { [key in WeekdayEnum]: number } = {
    [WeekdayEnum.MONDAY]: 1,
    [WeekdayEnum.TUESDAY]: 2,
    [WeekdayEnum.WEDNESDAY]: 3,
    [WeekdayEnum.THURSDAY]: 4,
    [WeekdayEnum.FRIDAY]: 5,
    [WeekdayEnum.SATURDAY]: 6,
    [WeekdayEnum.SUNDAY]: 7,
  }

  // Сортируем deliveryTimes с проверкой типа
  const sortedDeliveryTimes = [...area.deliveryTimes]
    .sort((a, b) => {
      // Приводим тип к WeekdayEnum для безопасности
      const dayA = a.dayOfWeek as WeekdayEnum
      const dayB = b.dayOfWeek as WeekdayEnum

      // Сначала сортируем по дням недели
      if (dayA !== dayB) {
        return weekdayOrder[dayA] - weekdayOrder[dayB]
      }
      // Затем по времени начала
      return a.startTime.localeCompare(b.startTime)
    })
    .map((time) => ({
      id: time.id,
      dayOfWeek: {
        value: time.dayOfWeek,
        label: dayOptions.find((d) => d.value === time.dayOfWeek)?.label || time.dayOfWeek,
      },
      startTime: {
        value: time.startTime,
        label: time.startTime,
      },
      endTime: {
        value: time.endTime,
        label: time.endTime,
      },
    }))

  return {
    ...area,
    deliveryTimes: sortedDeliveryTimes,
  }
}

// Запрос на получение списка зон доставки
export const useDeliveryAreas = (options?: FetchDeliveryAreasOptions) => {
  const query = useQuery<DeliveryArea[], Error>({
    queryKey: ['deliveryAreas', options?.storeId],
    queryFn: async () => {
      const response = await API.post<DeliveryAreaResponse[]>('/delivery-areas', {
        storeId: options?.storeId,
      })
      return response.data.map(formatDeliveryAreaData)
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    deliveryAreas: query.data,
  }
}

export const useCreateDeliveryArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDeliveryAreaData) => {
      const payload = {
        name: data.name,
        radius: Number(data.radius),
        address: {
          fullAddress: data.address,
          postal_code: data.postal_code,
          fias_id: data.fias_id,
          geo_lat: data.geo_lat,
          geo_lon: data.geo_lon,
        },
        deliveryTimes: data.deliveryTimes.map((time) => ({
          dayOfWeek: time.dayOfWeek.value,
          startTime: time.startTime.value,
          endTime: time.endTime.value,
        })),
      }

      const response = await API.post('/delivery-areas/create', payload)
      return formatDeliveryAreaData(response.data)
    },
    onSuccess: () => {
      // Инвалидация и повторный запрос
      queryClient.invalidateQueries({
        queryKey: ['deliveryAreas'],
        refetchType: 'active',
      })
    },
    onError: () => {
      toast('Ошибка при создании района доставки')
    },
  })
}

// Запрос на обновление зоны доставки
export const useUpdateDeliveryArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateDeliveryAreaData) => {
      const payload = {
        name: data.name,
        radius: Number(data.radius),
        address: {
          fullAddress: data.address,
          postal_code: data.postal_code,
          fias_id: data.fias_id,
          geo_lat: data.geo_lat,
          geo_lon: data.geo_lon,
        },
        deliveryTimes: data.deliveryTimes.map((time) => ({
          dayOfWeek: time.dayOfWeek.value,
          startTime: time.startTime.value,
          endTime: time.endTime.value,
        })),
      }

      const response = await API.put(`/delivery-areas/${data.id}`, payload)
      return formatDeliveryAreaData(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['deliveryAreas'],
        refetchType: 'active',
      })
    },
  })
}

// Запрос на удаление зоны доставки
export const useDeleteDeliveryArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await API.delete(`/delivery-areas/${id}`)
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<DeliveryArea[]>(['deliveryAreas'], (oldAreas = []) =>
        oldAreas.filter((area) => area.id !== deletedId),
      )
    },
  })
}
