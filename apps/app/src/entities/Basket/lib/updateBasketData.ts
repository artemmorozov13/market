import { BasketBaseType } from '@core/types/basket-tipe'
import { useQueryClient } from '@tanstack/react-query'

type BasketUpdateFn = (oldData: BasketBaseType[] | undefined) => BasketBaseType[]

export const updateBasketData = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: BasketUpdateFn,
) => {
  queryClient.setQueryData<BasketBaseType[]>(['basket'], (oldData) => {
    return updater(oldData)
  })
}
