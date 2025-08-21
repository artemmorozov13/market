import { ProductType } from '@core/types/product-item'
import { StoreUserBaseType } from '@core/types/store-user'
import { API } from '@shared/api/instance'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ProductStatusEnum } from '@core/enums/product-status-enum'

interface ChangeProductStatusParams {
  productId: number
  status: ProductStatusEnum
  comment?: string
}

export const changeProductStatus = async (options: ChangeProductStatusParams) => {
  const { productId, status, comment } = options

  const endpoint =
    status === ProductStatusEnum.Accepted
      ? `/offered-products/${productId}/accept`
      : status === ProductStatusEnum.Rejected
        ? `/offered-products/${productId}/reject`
        : status === ProductStatusEnum.Revoked
          ? `/offered-products/${productId}/revoke`
          : `/offered-products/${productId}/hidden`

  const response = await API.patch(endpoint, { comment })
  return response.data
}

export const useChangeProductStatus = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: changeProductStatus,
    onMutate: async (variables) => {
      // Отменяем текущие запросы, чтобы они не перезаписали наши оптимистичные обновления
      await queryClient.cancelQueries({ queryKey: ['products'] })
      await queryClient.cancelQueries({ queryKey: ['suppliers'] })

      // Сохраняем предыдущее состояние для возможного отката
      const previousProducts = queryClient.getQueryData(['products'])
      const previousSuppliers = queryClient.getQueryData(['suppliers'])

      // Оптимистичное обновление данных
      if (variables.status === ProductStatusEnum.Hidden) {
        // Удаляем товар из списка
        queryClient.setQueryData<ProductType[]>(['products'], (oldData) => {
          return oldData?.filter((product) => product.id !== variables.productId) ?? []
        })

        // Удаляем товар у поставщиков
        queryClient.setQueryData<StoreUserBaseType[]>(['suppliers'], (oldData) => {
          return (
            oldData?.map((supplier) => {
              const updatedProducts = supplier.products?.filter((p) => p.id !== variables.productId)
              return { ...supplier, products: updatedProducts }
            }) ?? []
          )
        })
      } else {
        // Обновляем статус товара
        queryClient.setQueryData<ProductType[]>(['products'], (oldData) => {
          return (
            oldData?.map((product) =>
              product.id === variables.productId
                ? { ...product, status: variables.status }
                : product,
            ) ?? []
          )
        })

        // Обновляем товар у поставщиков (без перезапроса)
        queryClient.setQueryData<StoreUserBaseType[]>(['suppliers'], (oldData) => {
          return (
            oldData?.map((supplier) => {
              const updatedProducts = supplier.products?.map((p) =>
                p.id === variables.productId ? { ...p, status: variables.status } : p,
              )
              return { ...supplier, products: updatedProducts }
            }) ?? []
          )
        })
      }

      return { previousProducts, previousSuppliers }
    },
    onSuccess: (data, variables, context) => {
      // Инвалидируем только продукты (если не hidden)
      if (variables.status !== ProductStatusEnum.Hidden) {
        queryClient.invalidateQueries({
          queryKey: ['products'],
          exact: false,
        })
      }

      // Убираем инвалидацию поставщиков, так как мы уже обновили их локально
      // queryClient.invalidateQueries({ queryKey: ['suppliers'] }); // Закомментировано

      toast.success(`Статус товара успешно изменен на "${variables.status}"`)
    },
    onError: (error, variables, context) => {
      // В случае ошибки возвращаем предыдущее состояние
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts)
      }
      if (context?.previousSuppliers) {
        queryClient.setQueryData(['suppliers'], context.previousSuppliers)
      }

      toast.error('Ошибка при изменении статуса товара')
    },
    onSettled: () => {
      // Можно добавить дополнительную логику после завершения мутации
    },
  })

  return {
    ...mutation,
    changeProductStatus: (productId: number, status: ProductStatusEnum, comment?: string) =>
      mutation.mutate({ productId, status, comment }),
  }
}
