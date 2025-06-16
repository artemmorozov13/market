import { FC, useState } from "react";
import { 
  Typography, 
  Box, 
  Divider, 
  Button,
  Paper,
  Avatar,
  Stack,
  Chip
} from "@mui/material";
import { Order } from "../../types/activeOrderTypes";
import { useAddressById } from "@/entities/Addresses";
import { ConfirmCancelOrder } from "../ConfirmCancelOrder/ConfirmCancelOrder";
import { useCancelOrder } from "@/entities/Order/api/cancelOrder";
import { useActiveOrder } from "../../api/useActiveOrder";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import styles from "./OrderDetails.module.scss";

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: FC<OrderDetailsProps> = ({ order }) => {
  const { address } = useAddressById({ addressId: order.address });
  const { refetch } = useActiveOrder();
  const { cancelOrder } = useCancelOrder();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    cancelOrder({ orderId: order.id }).then(() => refetch());
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

  const isAvailable = isDeliveryAvailable(order);
  const isCanceledByUser = order.status === OrderStatusEnum.CanceledByUser;
  const isCanceledByAdmin = order.status === OrderStatusEnum.CancelByAdmin;
  const isActive = order.status === OrderStatusEnum.WaitForPay;

  const renderStatusBanner = () => {
    if (isCanceledByUser) {
      return (
        <Box className={styles.statusBanner}>
          <Typography variant="subtitle1" fontWeight={600}>
            Заказ отменен вами
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Дата отмены: {new Date(order.updatedAt).toLocaleDateString("ru-RU")}
          </Typography>
        </Box>
      );
    }

    if (isCanceledByAdmin) {
      return (
        <Box className={styles.statusBanner}>
          <Typography variant="subtitle1" fontWeight={600}>
            Заказ отменен администратором
          </Typography>
          {order.cancelReason && (
            <Typography variant="body2">
              Причина: {order.cancelReason}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Дата отмены: {new Date(order.updatedAt).toLocaleDateString("ru-RU")}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <ConfirmCancelOrder
        open={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={order.id}
        onConfirm={handleConfirm}
      />
      
      <Paper className={styles.root} elevation={3}>
        {renderStatusBanner()}

        <Box className={styles.header}>
          <Typography variant="h6" component="h2">
            Информация о {isActive ? "доставке" : "заказе"}
          </Typography>
          {isActive && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={!isAvailable}
              onClick={() => setIsOpen(true)}
            >
              Отменить заказ
            </Button>
          )}
        </Box>

        <Divider className={styles.divider} />

        <Stack spacing={1} className={styles.section}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Номер заказа:</Typography>
            <Typography variant="body2">{order.id}</Typography>
          </Stack>

          {isActive && (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Дата доставки:</Typography>
                <Typography variant="body2">
                  {new Date(order.deliveryDate)?.toLocaleDateString("ru-RU")}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Временной интервал:</Typography>
                <Typography variant="body2">
                  {`${order?.deliveryTime?.startTime} - ${order?.deliveryTime?.endTime}`}
                </Typography>
              </Stack>
            </>
          )}

          {order.pickupPoint && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Пункт выдачи:</Typography>
              <Typography variant="body2">{order.pickupPoint.name}</Typography>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Адрес:</Typography>
            <Typography variant="body2">{order.fullAddress}</Typography>
          </Stack>

          {!!address?.entrance && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Парадная:</Typography>
              <Typography variant="body2">{address.entrance}</Typography>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Телефон:</Typography>
            <Typography variant="body2">{order.phoneNumber}</Typography>
          </Stack>

          {order.comment && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Комментарий:</Typography>
              <Typography variant="body2">{order.comment}</Typography>
            </Stack>
          )}
        </Stack>

        <Divider className={styles.divider} />

        <Box className={styles.section}>
          <Typography variant="h6" component="h3" gutterBottom>
            Список товаров
          </Typography>
          <Stack spacing={2}>
            {order.ordered_products.map((item) => (
              <Stack key={item.id} direction="row" spacing={2} className={styles.productItem}>
                <Avatar 
                  variant="rounded" 
                  src={item.product.image} 
                  alt={item.product.name}
                  sx={{ width: 64, height: 64 }}
                />
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} × {item.product.price} ₽ ={' '}
                    {(item.quantity * parseFloat(item.product.price)).toFixed(2)} ₽
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.totalSection}>
          <Typography variant="h6" fontWeight={700}>
            Итого: {order.totalAmount}₽
          </Typography>
        </Box>
      </Paper>
    </>
  );
};