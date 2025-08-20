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
import { ConfirmCancelOrder } from "../ConfirmCancelOrder/ConfirmCancelOrder";
import { useCancelOrder } from "@/entities/Order/api/cancelOrder";
import { useActiveOrder } from "../../api/useActiveOrder";
import { OrderStatusEnum } from "@core/enums/order-status-enum";
import styles from "./OrderDetails.module.scss";
import { formatRubbles } from "@core/utils/formatRubbles";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";

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
  
  const isDeliveryAvailable = (order: Order): boolean => {
    // 1. Для самовывоза всегда разрешаем изменение
    if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        return true;
    }

    const now = new Date();
    
    // 2. Создаем объект Date для точного времени начала доставки
    const deliveryStartDateTime = new Date(order.deliveryDate + 'T' + order.deliveryTime.startTime);
    
    // 3. Проверяем, не началась ли уже доставка
    if (now >= deliveryStartDateTime) {
        return false;
    }
    
    // 4. Вычисляем дедлайн для редактирования: время начала доставки минус minOrderBeforeDeliveryHours
    const editDeadline = new Date(deliveryStartDateTime);
    const hoursToSubtract = order?.store?.minOrderBeforeDeliveryHours || 1;
    editDeadline.setHours(editDeadline.getHours() - hoursToSubtract);
    
    // 5. Разрешаем редактирование только если текущее время РАНЬШЕ дедлайна
    return now < editDeadline;
  };

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
        <Box className={styles.workingHours}>
          {groupedHours.map((group, index) => (
            <Box key={index} className={styles.workingHoursItem}>
              <Typography className={styles.workingHoursDays}>
                {group.days.join(', ')}
              </Typography>
              <Typography className={styles.workingHoursTime}>
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

  // Функция для расчета цены со скидкой
  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  return (
    <>
      <ConfirmCancelOrder
        open={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={order.id}
        onConfirm={handleConfirm}
      />
      
      <div className={styles.root}>
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
              disabled={!isDeliveryAvailable(order)}
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
            {order.ordered_products.map((item) => {
              const price = Number(item.product.price);
              const discount = Number(item.product.discount) || 0;
              const hasDiscount = discount > 0;
              const discountedPrice = hasDiscount ? getDiscountedPrice(price, discount) : price;
              const total = item.quantity * discountedPrice;
              const originalTotal = item.quantity * price;

              return (
                <Stack key={item.id} direction="row" spacing={2} className={styles.productItem}>
                  <Avatar 
                    variant="rounded" 
                    src={item.product.image} 
                    alt={item.product.name}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {item.product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {hasDiscount ? (
                        <>
                          <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                            {formatRubbles(discountedPrice)}
                          </Typography>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            {formatRubbles(price)}
                          </Typography>
                          <Chip 
                            label={`-${discount}%`} 
                            size="small" 
                            color="error"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        </>
                      ) : (
                        <Typography variant="body2">
                          {formatRubbles(price)}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {item.quantity} шт. × {hasDiscount ? formatRubbles(discountedPrice) : formatRubbles(price)} ={' '}
                      <Typography component="span" fontWeight={500} color="text.primary">
                        {formatRubbles(total)}
                      </Typography>
                      {hasDiscount && (
                        <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', ml: 1 }}>
                          {formatRubbles(originalTotal)}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.totalSection}>
          <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
            {/* Промежуточные итоги */}
            {order.ordered_products.some(item => Number(item.product.discount) > 0) && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Сумма без скидки:
                </Typography>
                <Typography variant="body2">
                  {formatRubbles(order.ordered_products
                    .reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0))}
                </Typography>
              </Stack>
            )}
            {order.ordered_products.some(item => Number(item.product.discount) > 0) && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Скидка:
                </Typography>
                <Typography variant="body2" color="error.main">
                  -{formatRubbles(order.ordered_products
                    .reduce((sum, item) => {
                      const price = Number(item.product.price);
                      const discount = Number(item.product.discount) || 0;
                      return sum + (price * item.quantity * (discount / 100));
                    }, 0))}
                </Typography>
              </Stack>
            )}
            {/* Итоговая сумма */}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                Итого:
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatRubbles(order.totalAmount)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </div>
    </>
  );
};