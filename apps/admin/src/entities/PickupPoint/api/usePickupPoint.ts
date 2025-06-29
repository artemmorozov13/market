import { PickupPoint, PickupPointFormData } from '@pages/AdminPages/PickPointPage/types/pickupPointPageType';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pickupPointsApi } from './pickupPointApi';

export const usePickupPoints = () => {
  const query = useQuery<PickupPoint[]>({
    queryKey: ['pickupPoints'],
    queryFn: pickupPointsApi.getPickupPoints,
  });

  return {
    ...query,
    pickupPoints: query.data
  }
};

export const usePickupPoint = (id: number) => {
  return useQuery<PickupPoint>({
    queryKey: ['pickupPoint', id],
    queryFn: () => pickupPointsApi.getPickupPointById(id),
  });
};

export const useCreatePickupPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PickupPointFormData) => pickupPointsApi.createPickupPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupPoints'] });
    },
  });
};

export const useUpdatePickupPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PickupPointFormData) => pickupPointsApi.updatePickupPoint(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickupPoints'] });
      queryClient.invalidateQueries({ queryKey: ['pickupPoint', variables.id] });
    },
  });
};

export const useDeletePickupPoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pickupPointsApi.deletePickupPoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupPoints'] });
    },
  });
};