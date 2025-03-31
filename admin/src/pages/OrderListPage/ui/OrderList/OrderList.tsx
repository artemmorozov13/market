import React, { useState } from "react";
import { OrderType } from "@entities/Order";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styles from "./OrderList.module.scss"
import { OrderCard } from "@entities/Order/ui/OrderCard";

interface OrderListProps {
  orders: OrderType[];
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className={styles.list}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};