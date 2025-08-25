import { makeAutoObservable } from 'mobx'
import { IPromiseBasedObservable, fromPromise } from 'mobx-utils'
import { fetchOrderListData } from '../api/fetchOrderListData'
import { OrderType } from '@entities/Order'

class OrderListPageStore {
  orderList: IPromiseBasedObservable<OrderType[]> | null = null

  constructor() {
    makeAutoObservable(this)
  }

  fetchOrderList = () => {
    this.orderList = fromPromise(fetchOrderListData())
  }
}

export const orderListPageStore = new OrderListPageStore()
