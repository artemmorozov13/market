import { API } from '@/shared/api/API';
import { useQuery } from '@tanstack/react-query';
import { SelectOptionType } from '@/shared/ui/Select/types';
import { AddressType } from '@core/types/address-type';


export const fetchUserAddresses = async () => {
  const response = await API.get<AddressType[]>(`/addresses`);
  return response.data;
};

export const useUserAddresses = (userId?: number) => {
  const query = useQuery({
    queryKey: ['userAddresses', userId],
    queryFn: () => fetchUserAddresses(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const addressOptions = query.data?.map((address): SelectOptionType => ({
    value: address.id,
    label: address.fullAddress
  }))
  
  return {
    ...query,
    refetchAddresses: query.refetch,
    addresses: query.data,
    options: addressOptions
  }
};