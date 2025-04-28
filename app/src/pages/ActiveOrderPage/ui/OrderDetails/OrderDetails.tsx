import { FC } from "react";
import { Typography, Box, Divider } from "@mui/material";
import styles from "./OrderDetails.module.scss";
import { Order } from "../../types/activeOrderTypes";
import { DELIVERY_PRICE } from "@/shared/consts/applicationConsts";

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: FC<OrderDetailsProps> = ({ order }) => {
  const totalPrice = order.ordered_products.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Информация о доставке
      </Typography>

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
        <Typography className={styles.sectionTitle}>Товары</Typography>
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
          Итого: {(totalPrice + DELIVERY_PRICE).toFixed(2)} ₽
        </Typography>
      </Box>
    </Box>
  );
};
