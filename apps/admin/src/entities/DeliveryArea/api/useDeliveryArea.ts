import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '@shared/api/instance';
import { dayOptions } from '@pages/AdminPages/DeliveryAreasPage/consts/intervals';
import { DeliveryArea, DeliveryAreaForm, DeliveryAreaResponse } from '../types/pickupPointTypes';
import { toast } from 'react-toastify';

// Типы для параметров запросов
interface FetchDeliveryAreasOptions {
  storeId?: number;
}

interface CreateDeliveryAreaData extends DeliveryAreaForm {}

interface UpdateDeliveryAreaData extends CreateDeliveryAreaData {
  id: number;
}

const formatDeliveryAreaData = (area: DeliveryAreaResponse): DeliveryArea => ({
  ...area,
  deliveryTimes: area.deliveryTimes.map((time) => ({
    id: time.id,
    dayOfWeek: {
      value: time.dayOfWeek,
      label: dayOptions.find(d => d.value === time.dayOfWeek)?.label || time.dayOfWeek
    },
    startTime: {
      value: time.startTime,
      label: time.startTime
    },
    endTime: {
      value: time.endTime,
      label: time.endTime
    }
  }))
});

// Запрос на получение списка зон доставки
export const useDeliveryAreas = (options?: FetchDeliveryAreasOptions) => {
  const query = useQuery<DeliveryArea[], Error>({
    queryKey: ['deliveryAreas', options?.storeId],
    queryFn: async () => {
      const response = await API.post<DeliveryAreaResponse[]>('/delivery-areas', {
        storeId: options?.storeId
      });
      return response.data.map(formatDeliveryAreaData);
    },
    staleTime: 5 * 60 * 1000,
  });
  
  return {
    ...query,
    deliveryAreas: query.data,
  };
};

export const useCreateDeliveryArea = () => {
  const queryClient = useQueryClient();
  
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
        deliveryTimes: data.deliveryTimes.map(time => ({
          dayOfWeek: time.dayOfWeek.value,
          startTime: time.startTime.value,
          endTime: time.endTime.value
        }))
      };
      
      const response = await API.post('/delivery-areas/create', payload);
      return formatDeliveryAreaData(response.data);
    },
    onSuccess: () => {
      // Инвалидация и повторный запрос
      queryClient.invalidateQueries({ 
        queryKey: ['deliveryAreas'],
        refetchType: 'active'
      });
    },
    onError: () => {
      toast('Ошибка при создании района доставки')
    }
  });
};

// Запрос на обновление зоны доставки
export const useUpdateDeliveryArea = () => {
  const queryClient = useQueryClient();
  
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
        deliveryTimes: data.deliveryTimes.map(time => ({
          dayOfWeek: time.dayOfWeek.value,
          startTime: time.startTime.value,
          endTime: time.endTime.value
        }))
      };
      
      const response = await API.put(`/delivery-areas/${data.id}`, payload);
      return formatDeliveryAreaData(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['deliveryAreas'],
        refetchType: 'active'
      });
    }
  });
};

// Запрос на удаление зоны доставки
export const useDeleteDeliveryArea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await API.delete(`/delivery-areas/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<DeliveryArea[]>(['deliveryAreas'], (oldAreas = []) =>
        oldAreas.filter(area => area.id !== deletedId)
      );
    }
  });
};