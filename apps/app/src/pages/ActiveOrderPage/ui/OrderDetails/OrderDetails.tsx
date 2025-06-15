import { FC, useState } from "react";
import { Typography, Box, Divider, Button } from "@mui/material";
import styles from "./OrderDetails.module.scss";
import { Order } from "../../types/activeOrderTypes";
import { useAddressById } from "@/entities/Addresses";
import { ConfirmCancelOrder } from "../ConfirmCancelOrder/ConfirmCancelOrder";
import { useCancelOrder } from "@/entities/Order/api/cancelOrder";
import clsx from "clsx"
import { useActiveOrder } from "../../api/useActiveOrder";

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: FC<OrderDetailsProps> = ({ order }) => {
  const { address } = useAddressById({ addressId: order.address })

  const { refetch } = useActiveOrder()
  const { cancelOrder } = useCancelOrder()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleConfirm = () => {
    cancelOrder({ orderId: order.id })
      .then(() => refetch())
  }

  const isDeliveryAvailable = (order: Order): boolean => {
    if (!order.deliveryTime || !order.deliveryDate) return false;
    
    const now = new Date();
    const deliveryDate = new Date(order.deliveryDate + 'T00:00:00');
    
    if (deliveryDate <= now) return false;
    
    const dayBeforeDelivery = new Date(deliveryDate);
    dayBeforeDelivery.setDate(deliveryDate.getDate() - 1);
    dayBeforeDelivery.setHours(23, 0, 0, 0);
    
    return (
      now < dayBeforeDelivery
    );
  };

  const isAvailable = isDeliveryAvailable(order)

  return (
    <>
      <ConfirmCancelOrder
        open={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={order.id}
        onConfirm={handleConfirm}
      />
      <Box className={clsx(styles.container, { [styles.canceledOrder]: order.status === 'canceled_by_user' })}>
        <div className={styles.orderActions}>
          <Typography variant="h5" className={styles.title}>
            Информация о доставке
          </Typography>
          {order.status !== 'canceled_by_user' && (
            <Button
              variant="outlined"
              color="error"
              disabled={!isAvailable}
              onClick={() => setIsOpen(true)}
            >
              Отменить заказ
            </Button>
          )}
        </div>

        <Divider className={styles.divider} />

        <Box className={styles.section}>
          <Box className={styles.infoBlock}>
            <span>Номер заказа:</span>
            <span>{order.id}</span>
          </Box>

          <Box className={styles.infoBlock}>
            <span>Дата:</span>
            <span>{new Date(order.deliveryDate)?.toLocaleDateString("ru-RU")}</span>
          </Box>
          <Box className={styles.infoBlock}>
            <span>Время:</span>
            <span>{`${order?.deliveryTime?.startTime} - ${order?.deliveryTime?.endTime}`}</span>
          </Box>
          {order.pickupPoint && (
            <Box className={styles.infoBlock}>
              <span>Пункт выдачи:</span>
              <span>{order.pickupPoint.name}</span>
            </Box>
          )}
          <Box className={styles.infoBlock}>
            <span>Адрес:</span>
            <span>{order.fullAddress}</span>
          </Box>
          {!!address?.entrance && (
            <Box className={styles.infoBlock}>
              <span>Парадная:</span>
              <span>{address.entrance}</span>
            </Box>
          )}
          <Box className={styles.infoBlock}>
            <span>Телефон:</span>
            <span>{order.phoneNumber}</span>
          </Box>
          {order.comment && (
            <Box className={styles.infoBlock}>
              <span>Комментарий:</span>
              <span>{order.comment}</span>
            </Box>
          )}
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.section}>
          <Typography
            variant="h5"
            className={styles.sectionTitle}
          >Список товаров</Typography>
          {order.ordered_products.map((item) => (
            <Box key={item.id} className={styles.productItem}>
              <img
                src={item.product.image}
                alt={item.product.name}
                className={styles.productImage}
              />
              <Box className={styles.productInfo}>
                <Typography className={styles.productName}>
                  {item.product.name}
                </Typography>
                <Typography className={styles.productPrice}>
                  {item.quantity} × {item.product.price} ₽ ={" "}
                  {(item.quantity * parseFloat(item.product.price)).toFixed(2)} ₽
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Divider className={styles.divider} />
        <Box className={styles.totalSection}>
          <Typography variant="h6">
            Итого: {order.totalAmount}₽
          </Typography>
        </Box>
      </Box>
    </>
  );
};
