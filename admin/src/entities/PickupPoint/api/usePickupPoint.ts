import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '@shared/api/instance';
import { DayOption, PickupPoint, PickupPointForm, PickupPointResponse, TimeOption } from '../types/pickupPointTypes';
import { dayOptions } from '@pages/PickPointPage/consts/intervals';


// Типы для параметров запросов
interface FetchPickupPointsOptions {

};

interface CreatePickupPointData extends PickupPointForm {
    
}

interface UpdatePickupPointData extends CreatePickupPointData {
    id: number
}


const formatPickupPointData = (point: PickupPointResponse): PickupPoint => ({
  ...point,
  deliveryTimes: point.deliveryTimes.map((time) => ({
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

// Запрос на получение списка пунктов выдачи
export const usePickupPoints = (options?: FetchPickupPointsOptions) => {
  const query = useQuery<PickupPoint[]>({
    queryKey: ['pickupPoints'],
    queryFn: async () => {
      const response = await API.get<PickupPointResponse[]>('/pickup-points');
      return response.data.map(formatPickupPointData);
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
  return {
    ...query,
    pickupPoints: query.data
  }
};

// Запрос на создание пункта выдачи
export const useCreatePickupPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePickupPointData) => {
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
      
      const response = await API.post('/pickup-points', payload);
      return formatPickupPointData(response.data);
    },
    onSuccess: (newPoint) => {
      queryClient.setQueryData<PickupPoint[]>(['pickupPoints'], (oldPoints = []) => [
        ...oldPoints,
        newPoint
      ]);
    }
  });
};

// Запрос на обновление пункта выдачи
export const useUpdatePickupPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdatePickupPointData) => {
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
      
      const response = await API.put(`/pickup-points/${data.id}`, payload);
      return formatPickupPointData(response.data);
    },
    onSuccess: (updatedPoint) => {
      queryClient.setQueryData<PickupPoint[]>(['pickupPoints'], (oldPoints = []) =>
        oldPoints.map(point => point.id === updatedPoint.id ? updatedPoint : point)
      );
    }
  });
};

// Запрос на удаление пункта выдачи
export const useDeletePickupPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await API.delete(`/pickup-points/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<PickupPoint[]>(['pickupPoints'], (oldPoints = []) =>
        oldPoints.filter(point => point.id !== deletedId)
      );
    }
  });
};