import { makeAutoObservable } from 'mobx'
import { Order } from '../types/activeOrderTypes'
import { OrderBasketType } from '../ui/EditOrderModal/EditOrderModal'

class EditOrderModalStore {
  order: Order | null = null
  editingOrder: Order | null = null
  selectedProducts: number[] = []
  adaptedProducts: OrderBasketType[] = []
  totalPrice: number = 0
  totalItems: number = 0

  constructor() {
    makeAutoObservable(this)
  }

  updateEditingOrder = (updatedOrder: Order) => {
    this.editingOrder = updatedOrder
  }

  increaseProduct = (productId: number) => {
    if (this.editingOrder?.ordered_products) {
      this.editingOrder.ordered_products = this.editingOrder?.ordered_products.map((product) => {
        if (product.product.id === productId) {
          return {
            ...product,
            quantity: product.quantity + 1,
          }
        }
        return product
      })
    }
  }

  decreaseProduct = (productId: number) => {
    if (this.editingOrder?.ordered_products) {
      this.editingOrder.ordered_products = this.editingOrder?.ordered_products.map((product) => {
        if (product.product.id === productId) {
          if (product.quantity < 1) {
            return {
              ...product,
              quantity: 0,
            }
          }
          return {
            ...product,
            quantity: product.quantity - 1,
          }
        }
        return product
      })
    }
  }

  updateSelectedProducts = (selectedProducts: number[]) => {
    this.selectedProducts = selectedProducts
  }

  updateAdaptedProducts = (selectedProducts: OrderBasketType[]) => {
    this.adaptedProducts = selectedProducts
  }
}

export const editOrderModalStore = () => new EditOrderModalStore()
