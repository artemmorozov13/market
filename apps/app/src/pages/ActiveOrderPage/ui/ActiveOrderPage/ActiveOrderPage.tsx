import { FC, useState } from 'react'
import { Layout } from '@/widgets/Layout'
import { Card, CircularProgress, Container, Button } from '@mui/material'
import { userStore } from '@/entities/User'
import { OrderStatusEnum } from '@core/enums/order-status-enum'
import { useActiveOrder } from '../../api/useActiveOrder'
import { Order } from '../../types/activeOrderTypes'
import { OrderDetails } from '../OrderDetails/OrderDetails'
import { EditOrderModal } from '../EditOrderModal/EditOrderModal'
import styles from './ActiveOrderPage.module.scss'
import { Roles } from '@core/enums/role-enum'

const ActiveOrderPage: FC = () => {
  const { role } = userStore
  const { data: orders, isLoading } = useActiveOrder()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleCloseModals = () => {
    setIsEditModalOpen(false)
    setSelectedOrder(null)
  }

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order)
    setIsEditModalOpen(true)
  }

  const renderContent = () => {
    if (role !== Roles.User) {
      return (
        <div className={styles.empty}>
          <h2>У вас нет активных заказов</h2>
          <p>Вы можете оформить новый заказ в каталоге товаров</p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      )
    }

    if (!orders || orders.length === 0) {
      return (
        <div className={styles.empty}>
          <h2>У вас нет активных заказов</h2>
          <p>Вы можете оформить новый заказ в каталоге товаров</p>
        </div>
      )
    }

    return (
      <div>
        {orders.map((order) => {
          const isCanceled = 
            order.status === OrderStatusEnum.CanceledByUser || 
            order.status === OrderStatusEnum.CancelByAdmin
          
          const canEdit = order.status === OrderStatusEnum.Created

          return (
            <Card 
              key={order.id} 
              className={`${styles.card} ${isCanceled ? styles.canceledCard : ''}`}
            >
              <OrderDetails order={order} />
              {!isCanceled && (
                <div className={styles.actions}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenEditModal(order)}
                    className={styles.editButton}
                    disabled={!canEdit}
                    fullWidth
                  >
                    Изменить состав
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Layout>
      {renderContent()}
      {selectedOrder && (
        <EditOrderModal open={isEditModalOpen} onClose={handleCloseModals} order={selectedOrder} />
      )}
    </Layout>
  )
}

export default ActiveOrderPage