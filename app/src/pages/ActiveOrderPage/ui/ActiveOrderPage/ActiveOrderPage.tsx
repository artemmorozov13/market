import { FC, useEffect, useState } from "react";
import { Layout } from "@/widgets/Layout";
import { Button, Card, CardContent, Typography, CircularProgress, Container } from "@mui/material";
import styles from "./ActiveOrderPage.module.scss";
import { API } from "@/shared/api/API";
import { OrderDetails } from "../OrderDetails/OrderDetails";
import { OrderProductsModal } from "../OrderProductsModal/OrderProductsModal";
import { EditOrderModal } from "../EditOrderModal/EditOrderModal";

const ActiveOrderPage: FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("/order/current");
        setOrders(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке заказов", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenEditModal = (order: any) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleOpenProductsModal = (order: any) => {
    setSelectedOrder(order);
    setIsProductsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsProductsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Layout>
      <Container>
        <div className={styles.container}>
          <Typography variant="h4" className={styles.title}>
            Управление активными заказами
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : orders.length > 0 ? (
            <div className={styles.list}>
              {orders.map((order) => (
                <Card key={order.id} className={styles.card}>
                  <CardContent>
                    <OrderDetails order={order} />
                    <div className={styles.actions}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenProductsModal(order)}
                        className={styles.button}
                        disabled
                      >
                        Добавить / изменить товары
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenEditModal(order)}
                        className={styles.button}
                        disabled
                      >
                        Редактировать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="h6" className={styles.noOrders}>
              У вас нет активных заказов
            </Typography>
          )}
          <OrderProductsModal open={isProductsModalOpen} onClose={handleCloseModals} order={selectedOrder} />
          <EditOrderModal open={isEditModalOpen} onClose={handleCloseModals} order={selectedOrder} />
        </div>
      </Container>
    </Layout>
  );
};

export default ActiveOrderPage;
