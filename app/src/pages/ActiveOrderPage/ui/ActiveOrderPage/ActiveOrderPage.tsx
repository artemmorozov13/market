import { FC, useState } from "react";
import { Layout } from "@/widgets/Layout";
import { Card, CircularProgress, Container, Button } from "@mui/material";
import { useActiveOrder } from "../../api/useActiveOrder";
import { Order } from "../../types/activeOrderTypes";
import { OrderDetails } from "../OrderDetails/OrderDetails";
import { EditOrderModal } from "../EditOrderModal/EditOrderModal";
import styles from "./ActiveOrderPage.module.scss";
import { getAvailableDeliveryDates } from "@/shared/helpers/getAvailableDeliveryDates";
import { userStore } from "@/entities/User";

export const ActiveOrderPage: FC = () => {
  const { role } = userStore
  const { data: orders, isLoading } = useActiveOrder();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const isDeliveryAvailable = (order: Order): boolean => {
    if (!order.deliveryTime || !order.deliveryDate) return false;
    
    const deliveryDayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(order.deliveryTime.dayOfWeek);
    const deliveryDay = deliveryDayIndex === 0 ? 7 : deliveryDayIndex + 1;
    
    const availableDates = getAvailableDeliveryDates([deliveryDay]);

    const deliveryDate = new Date(order.deliveryDate + 'T00:00:00');
    
    const isDeleveryAvailable = availableDates.some(date => 
      date.toISOString().split('T')[0] === deliveryDate.toISOString().split('T')[0]
    )
    return isDeleveryAvailable
  };

  const renderContent = () => {
    if (role !== 'customer') {
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

    const activeOrders = orders?.filter(order => order.status === 'waitForPay');
    const canceledOrders = orders?.filter(order => order.status === 'canceled_by_user');

    return (
      <div>
        {activeOrders && activeOrders?.length > 0 && (
          <>
            {activeOrders.map(order => (
              <Card key={order.id} className={styles.card}>
                <OrderDetails order={order} />
                <div className={styles.actions}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenEditModal(order)}
                    className={styles.editButton}
                    disabled={!isDeliveryAvailable(order)}
                    fullWidth
                  >
                    Изменить состав
                  </Button>
                </div>
              </Card>
            ))}
          </>
        )}

        {canceledOrders && canceledOrders?.length > 0 && (
          <>
            {canceledOrders.map(order => (
              <Card key={order.id} className={`${styles.card} ${styles.canceledCard}`}>
                <OrderDetails order={order} />
              </Card>
            ))}
          </>
        )}

        {!activeOrders?.length && !canceledOrders?.length && (
          <div className={styles.empty}>
            <h2>У вас нет активных заказов</h2>
            <p>Вы можете оформить новый заказ в каталоге товаров</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <div className={styles.container}>      
          {renderContent()}

          {selectedOrder && (
            <EditOrderModal
              open={isEditModalOpen}
              onClose={handleCloseModals}
              order={selectedOrder}
            />
          )}
        </div>
      </Container>
    </Layout>
  );
};