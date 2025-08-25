import { makeAutoObservable } from 'mobx'
import { BasketType } from '..'
import { fetchBasketListData } from '../api/fetchBasketListData'

class BasketStore {
  basketList: BasketType[] = []

  constructor() {
    makeAutoObservable(this)
  }

  clearBasket = () => {
    this.basketList = []
  }

  fetchBasketList = async () => {
    try {
      const data = await fetchBasketListData()
      this.basketList = data
    } catch (error) {
      console.error('Failed to fetch basket list:', error)
    }
  }

  increaseProductCount = (basketProductId: number) => {
    const currentItemIndex = this.basketList.findIndex(
      (basketItem) => basketItem.id === basketProductId,
    )

    if (currentItemIndex >= 0) {
      this.basketList[currentItemIndex].count += 1
    }
  }

  decreaseProductCount = (basketProductId: number) => {
    const currentItemIndex = this.basketList.findIndex(
      (basketItem) => basketItem.id === basketProductId,
    )

    if (currentItemIndex >= 0) {
      this.basketList[currentItemIndex].count -= 1
    }
  }

  addItem = async (item: BasketType) => {
    try {
      // await pushBasketItem(item);
      this.basketList.push(item)
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  removeItem = async (itemId: number) => {
    try {
      // await removeBasketItem(itemId);
      this.basketList = this.basketList.filter((item) => item.id !== itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }
}

export const basketStore = new BasketStore()
