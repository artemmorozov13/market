import { FC } from 'react'
import styles from './OrderPage.module.scss'
import { Layout } from '@/widgets/Layout'
import { observer } from 'mobx-react-lite'
import { OrderForm, orderFormStore } from '@/features/OrderForm'
import { OrderFormInputs } from '@/features/OrderForm/types/orderFormTypes'
import { RoutePath } from '@/shared/routes/routeConfig'
import { createOrder } from '@/entities/Order/api/createOrder'
import { useNavigate } from 'react-router'

const OrderPage: FC = observer(() => {
  const navigate = useNavigate()
  const { setComplitedForm } = orderFormStore

  const handleCreateOrder = (formData: OrderFormInputs) => {
    setComplitedForm(formData)

    createOrder(formData)
      .then(() => {
        navigate(RoutePath.activeOrders)
      })
      .catch((error) => {
        console.error('Order creation failed:', error)
        // Handle error (show notification, etc.)
      })
  }

  return (
    <Layout className={styles.wrapper}>
      <OrderForm onSubmit={handleCreateOrder} />
    </Layout>
  )
})

export default OrderPage
