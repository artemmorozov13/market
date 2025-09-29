import { FC, useState } from "react";
import { Layout } from "@/widgets/Layout";
import { Card, CircularProgress, Container, Button } from "@mui/material";
import { userStore } from "@/entities/User";
import { OrderStatusEnum } from "@core/enums/order-status-enum"

import { useActiveOrder } from "../../api/useActiveOrder";
import { Order } from "../../types/activeOrderTypes";
import { OrderDetails } from "../OrderDetails/OrderDetails";
import { EditOrderModal } from "../EditOrderModal/EditOrderModal";

import styles from "./ActiveOrderPage.module.scss";
import { Roles } from "@core/enums/role-enum";

export const ActiveOrderPage: FC = () => {
  const { role } = userStore;
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
    
    const now = new Date();
    const deliveryDate = new Date(order.deliveryDate + 'T00:00:00');
    
    if (deliveryDate <= now) return false;
    
    const dayBeforeDelivery = new Date(deliveryDate);
    dayBeforeDelivery.setDate(deliveryDate.getDate() - 1);
    dayBeforeDelivery.setHours(23, 0, 0, 0);
    
    return now < dayBeforeDelivery;
  };

  const renderContent = () => {
    if (role !== Roles.User) {
      return (
        <div className={styles.empty}>
          <h2>У вас нет активных заказов</h2>
          <p>Вы можете оформить новый заказ в каталоге товаров</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      );
    }

    const activeOrders = orders?.filter(order => order.status === OrderStatusEnum.WaitForPay);
    const canceledByUserOrders = orders?.filter(order => order.status === OrderStatusEnum.CanceledByUser);
    const canceledByAdminOrders = orders?.filter(order => order.status === OrderStatusEnum.CancelByAdmin);

    return (
      <div>
        {activeOrders && activeOrders.length > 0 && (
          activeOrders.map(order => (
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
          ))
        )}

        {canceledByUserOrders && canceledByUserOrders.length > 0 && (
          canceledByUserOrders.map(order => (
            <Card key={order.id} className={`${styles.card} ${styles.canceledCard}`}>
              <OrderDetails order={order} />
            </Card>
          ))
        )}

        {canceledByAdminOrders && canceledByAdminOrders.length > 0 && (
          canceledByAdminOrders.map(order => (
            <Card key={order.id} className={`${styles.card} ${styles.canceledCard}`}>
              <OrderDetails order={order} />
            </Card>
          ))
        )}

        {!activeOrders?.length && !canceledByUserOrders?.length && !canceledByAdminOrders?.length && (
          <div className={styles.empty}>
            <h2>У вас нет активных заказов</h2>
            <p>Вы можете оформить новый заказ в каталоге товаров</p>
          </div>
        )}
      </div>
    );
  };

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