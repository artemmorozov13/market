import { FC } from "react";
import { Typography, Box, Divider } from "@mui/material";
import styles from "./OrderDetails.module.scss";
import { Order } from "../../types/activeOrderTypes";

interface OrderDetailsProps {
  order: Order;
}

// const statusMap: Record<string, string> = {
//   waitForPay: "Ожидает оплаты",
//   // добавьте другие статусы по мере необходимости
// };

export const OrderDetails: FC<OrderDetailsProps> = ({ order }) => {
  // const statusText = statusMap[order.status] || order.status;
  const totalPrice = order.ordered_products.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <Box className={styles.container}>
      {/* <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" className={styles.title}>
          Заказ #{order.id}
        </Typography>
        <Chip
          label={statusText}
          color={
            order.status === "waitForPay" ? "warning" : "primary"
          }
        />
      </Stack> */}

      {/* <Divider className={styles.divider} /> */}

      <Box className={styles.section}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          Информация о доставке
        </Typography>
        <Typography>
          <strong>Дата доставки:</strong>{" "}
          {new Date(order.deliveryDate).toLocaleDateString("ru-RU")}
        </Typography>
        {order.pickupPoint && (
          <Typography>
            <strong>Пункт выдачи:</strong> {order.pickupPoint.name}
          </Typography>
        )}
        <Typography>
          <strong>Адрес:</strong> {order.fullAddress}
        </Typography>
        <Typography>
          <strong>Телефон:</strong> {order.phoneNumber}
        </Typography>
        {order.comment && (
          <Typography>
            <strong>Комментарий:</strong> {order.comment}
          </Typography>
        )}
      </Box>

      <Divider className={styles.divider} />

      <Box className={styles.section}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          Товары
        </Typography>
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
              <Typography>
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
          Итого: {totalPrice.toFixed(2)} ₽
        </Typography>
      </Box>
    </Box>
  );
};