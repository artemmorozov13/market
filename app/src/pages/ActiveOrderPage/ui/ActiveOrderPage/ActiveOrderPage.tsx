import { FC, useState } from "react";
import { Layout } from "@/widgets/Layout";
import { Button, Card, CircularProgress, Container } from "@mui/material";
import styles from "./ActiveOrderPage.module.scss";
import { useActiveOrder } from "../../api/useActiveOrder";
import { Order } from "../../types/activeOrderTypes";
import { OrderDetails } from "../OrderDetails/OrderDetails";
import { EditOrderModal } from "../EditOrderModal/EditOrderModal";

export const ActiveOrderPage: FC = () => {
  const { data: orders, isLoading } = useActiveOrder();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <div className={styles.container}>
          <h1 className={styles.title}>Активный заказ</h1>

          {isLoading ? (
            <div className={styles.loading}>
              <CircularProgress />
            </div>
          ) : orders && orders.length > 0 ? (
            <Card className={styles.card}>
              <OrderDetails order={orders[0]} />
              <div className={styles.actions}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenEditModal(orders[0])}
                  className={styles.editButton}
                  disabled
                  sx={{ m: 1 }}
                >
                  Добавить товары
                </Button>
              </div>
            </Card>
          ) : (
            <div className={styles.empty}>
              <h2>У вас нет активных заказов</h2>
              <p>Вы можете оформить новый заказ в каталоге товаров</p>
            </div>
          )}

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