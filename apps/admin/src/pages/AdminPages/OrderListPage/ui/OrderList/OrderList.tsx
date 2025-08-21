import React, { useState } from 'react'
import { OrderType } from '@entities/Order'

import styles from './OrderList.module.scss'
import { OrderCard } from '@entities/Order/ui/OrderCard'

interface OrderListProps {
  orders: OrderType[]
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  return (
    <div className={styles.list}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
