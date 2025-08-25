import { StoreUserBaseType } from '@core/types/store-user'
import { CreateSupplierFormSchema } from '@features/CreateSupplierModal'
import { API } from '@shared/api/instance'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const createSupplier = async (storeData: CreateSupplierFormSchema) => {
  const response = await API.post<StoreUserBaseType>('/store-user/create/vendor', storeData)
  toast('Аккаунт партнера создан', { type: 'success' })
  return response.data
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      })
    },
  })

  return {
    ...mutation,
    createSupplier: mutation.mutateAsync,
  }
}
