import { useMutation } from '@tanstack/react-query';
import { API } from '@/shared/api/API';
import { AddressFormValues } from '@/features/AddNewAddressModal';

export const useSaveAddress = () => {
  const options = useMutation({
    mutationKey: ["address"],
    mutationFn: async (addressData: AddressFormValues) => {
      const body = {
        fullAddress: addressData.fullAddress,
        entrance: addressData.entrance,
        floor: addressData.floor,
        apartment: addressData.apartment,
        intercom: addressData.intercom,
        addressData: {
            postal_code: addressData.addressData.postal_code,
            fias_id: addressData.addressData.fias_id,
            geo_lat: addressData.addressData.geo_lat,
            geo_lon: addressData.addressData.geo_lon,
        }
      }

      const response = await API.post('/addresses', body);
      return response.data;
    },
    onSuccess: () => {
    },
    onError: () => {
    },
  });
  return {
    ...options,
    saveAddress: options.mutateAsync,
    isSaving: options.isPending
  }
};