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
  const { refetch } = useActiveOrder();
  const { cancelOrder } = useCancelOrder();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    cancelOrder({ orderId: order.id }).then(() => refetch());
  };

  const isPickup = order.orderDeliveryStrategy === "pickup_by_yourself";
  
  // Для самовывоза всегда доступно изменение/отмена
  // Для доставки - только если не прошла дата доставки
  const isAvailable = isPickup ? true : (() => {
    const now = new Date();
    const deliveryDate = new Date(order.deliveryDate + 'T00:00:00');
    
    if (!order.deliveryTime || deliveryDate <= now) return false;
    
    const dayBeforeDelivery = new Date(deliveryDate);
    dayBeforeDelivery.setDate(deliveryDate.getDate() - 1);
    dayBeforeDelivery.setHours(23, 0, 0, 0);
    
    return now < dayBeforeDelivery;
  })();

  const renderWorkingHours = (workingHours: any[]) => {
    if (!workingHours || workingHours.length === 0) return null;

    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const daysMap: Record<string, string> = {
      monday: 'Пн',
      tuesday: 'Вт',
      wednesday: 'Ср',
      thursday: 'Чт',
      friday: 'Пт',
      saturday: 'Сб',
      sunday: 'Вс'
    };

    const sortedHours = [...workingHours].sort((a, b) => 
      daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek)
    );

    const groupedHours: {days: string[]; time: string}[] = [];
    let currentGroup: {days: string[]; time: string} | null = null;

    sortedHours.forEach(day => {
      const timeStr = `${day.openingTime.slice(0, 5)}-${day.closingTime.slice(0, 5)}`;
      
      if (currentGroup && currentGroup.time === timeStr) {
        currentGroup.days.push(daysMap[day.dayOfWeek]);
      } else {
        currentGroup = {
          days: [daysMap[day.dayOfWeek]],
          time: timeStr
        };
        groupedHours.push(currentGroup);
      }
    });

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
          Режим работы:
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            background: 'rgba(0, 0, 0, 0.02)',
            p: 1.5,
            borderRadius: 1
          }}
        >
          {groupedHours.map((group, index) => (
            <Box 
              key={index} 
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {group.days.join(', ')}
              </Typography>
              <Typography variant="body2">
                {group.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const isCanceledByUser = order.status === OrderStatusEnum.CanceledByUser;
  const isCanceledByAdmin = order.status === OrderStatusEnum.CancelByAdmin;
  const isActive = order.status === OrderStatusEnum.WaitForPay;
  const isDelivery = order.orderDeliveryStrategy === "delivery_to_entrance";

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

  const renderDeliveryInfo = () => {
    if (isPickup) {
      return (
        <>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Тип заказа:</Typography>
            <Typography variant="body2">Самовывоз</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Пункт выдачи:</Typography>
            <Typography variant="body2" fontWeight={500}>{order.pickupPoint?.name}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Адрес:</Typography>
            <Typography variant="body2" textAlign="right">{order.fullAddress}</Typography>
          </Stack>
          {order.pickupPoint?.workingHours && renderWorkingHours(order.pickupPoint.workingHours)}
        </>
      );
    }

    if (isDelivery) {
      return (
        <>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Тип заказа:</Typography>
            <Typography variant="body2">Доставка</Typography>
          </Stack>
          {isActive && (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Дата доставки:</Typography>
                <Typography variant="body2">
                  {new Date(order.deliveryDate)?.toLocaleDateString("ru-RU", {
                    day: 'numeric',
                    month: 'long'
                  })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Временной интервал:</Typography>
                <Typography variant="body2">
                  {order.deliveryTime ? `${order.deliveryTime.startTime.slice(0, 5)}-${order.deliveryTime.endTime.slice(0, 5)}` : 'Не указано'}
                </Typography>
              </Stack>
            </>
          )}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Адрес доставки:</Typography>
            <Typography variant="body2" textAlign="right">{`${order.fullAddress}`}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Телефон:</Typography>
            <Typography variant="body2">{order.phoneNumber}</Typography>
          </Stack>
        </>
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
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="h2">
              {isPickup ? "Информация о самовывозе" : "Информация о доставке"}
            </Typography>
            <Chip 
              label={isPickup ? "Самовывоз" : "Доставка"} 
              color={isPickup ? "primary" : "secondary"} 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
          </Box>
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

        <Stack spacing={2} className={styles.section}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Номер заказа:</Typography>
            <Typography variant="body2">№{order.id}</Typography>
          </Stack>
          
          {renderDeliveryInfo()}

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
            Состав заказа
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
                    {item.quantity} × {Number(item.product.price).toFixed()} ₽ ={' '}
                    {(item.quantity * Number(item.product.price)).toFixed()} ₽
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.totalSection}>
          <Typography variant="h6" fontWeight={700}>
            Итого: {Number(order.totalAmount).toFixed()}₽
          </Typography>
        </Box>
      </Paper>
    </>
  );
};