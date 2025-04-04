import { Typography } from "@mui/material";
import { FC } from "react";

export const OrderDetails: FC<{ order: any }> = ({ order }) => (
    <div>
      <Typography variant="h6">Заказ #{order.id}</Typography>
      <Typography>Адрес: {order.address}</Typography>
      <Typography>Телефон: {order.phoneNumber}</Typography>
      <Typography>Дата доставки: {new Date(order.deliveryDate).toLocaleDateString()}</Typography>
    </div>
  );