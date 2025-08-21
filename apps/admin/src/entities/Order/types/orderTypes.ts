import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum'
import { OrderStatusEnum } from '@core/enums/order-status-enum'
import { PickupPointType } from '@core/types/pickup-point-type'
import { ProductType } from '@core/types/product-item'
import { StoreOwnerUserType } from '@entities/User/types/userTypes'

export interface OrderedProductType {
  id: number
  telegram_id: number
  quantity: number
  product: ProductType
}

export interface OrderType {
  id: number
  status:
    | OrderStatusEnum.Finished
    | OrderStatusEnum.WaitForPay
    | OrderStatusEnum.CanceledByUser
    | OrderStatusEnum.CancelByAdmin
    | OrderStatusEnum.FinishedAndRated
  createdAt: Date
  updated_at: Date
  address: string
  fullAddress: string
  phoneNumber?: string
  pickupPoint: PickupPointType
  comment?: string
  deliveryDate: string
  totalAmount: string
  user: StoreOwnerUserType
  orderDeliveryStrategy: DeliveryStrategyEnum
  ordered_products: OrderedProductType[]
  deliveryArea?: {
    id: number
    name: string
    address?: string
  }
  deliveryTime?: {
    id: number
    startTime: string
    endTime: string
  }
}
