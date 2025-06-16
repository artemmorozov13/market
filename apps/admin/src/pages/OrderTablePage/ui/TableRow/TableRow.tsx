import { FC, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  Box,
  Typography,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TableOrder } from "../../lib/adaptOrdersToTable";
import { OrderStatusEnum } from "@core/enums/order-status-enum";

import styles from "./TableRow.module.scss";

interface RowProps {
    order: TableOrder;
    isSelected: boolean;
    onSelect: (id: number, isSelected: boolean) => void;
}

const statusLabels: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.WaitForPay]: "Ожидает оплаты",
    [OrderStatusEnum.Finished]: "Завершен",
    [OrderStatusEnum.CanceledByUser]: "Отменен клиентом",
    [OrderStatusEnum.CancelByAdmin]: "Отменен администратором",
    [OrderStatusEnum.FinishedAndRated]: "Завершен и оценен"
};

const statusColors: Record<OrderStatusEnum, "warning" | "success" | "error" | "info"> = {
    [OrderStatusEnum.WaitForPay]: "warning",
    [OrderStatusEnum.Finished]: "success",
    [OrderStatusEnum.CanceledByUser]: "error",
    [OrderStatusEnum.CancelByAdmin]: "error",
    [OrderStatusEnum.FinishedAndRated]: "success"
};

export const Row: FC<RowProps> = ({ order, isSelected, onSelect }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(order.id, e.target.checked);
    };

    return (
        <>
            <TableRow hover>
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={isSelected}
                        onChange={handleSelect}
                        disabled={order.status !== OrderStatusEnum.WaitForPay}
                    />
                </TableCell>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">№</Typography>
                    {order.id}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Адрес</Typography>
                    {order.fullAddress}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Пункт выдачи</Typography>
                    {order.pickupPointName || 'Не указан'}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Приоритет</Typography>
                    {order.priority}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Дата доставки</Typography>
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("Ru-ru") : 'Не указана'}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Время доставки</Typography>
                    {order.deliveryTimeRange || 'Не указано'}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Телефон</Typography>
                    {order.phone}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Комментарий</Typography>
                    {order.comment || 'Нет комментария'}
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold">Сумма</Typography>
                    {order.totalAmount} ₽
                </TableCell>
                <TableCell>
                    <Button 
                        color={statusColors[order.status]}
                    >
                        {statusLabels[order.status]}
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                Товары в заказе
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Наименование</TableCell>
                                        <TableCell align="right">Цена</TableCell>
                                        <TableCell align="right">Количество</TableCell>
                                        <TableCell align="right">Скидка</TableCell>
                                        <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.ordered_products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.product.name}</TableCell>
                                            <TableCell align="right">{product.product.price} ₽</TableCell>
                                            <TableCell align="right">{product.quantity}</TableCell>
                                            <TableCell align="right">{product.product.discount}%</TableCell>
                                            <TableCell align="right">
                                                {order.totalAmount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4} align="right">
                                            <strong>Итого:</strong>
                                        </TableCell>
                                        <TableCell align="right">
                                            <strong>
                                                {order.totalAmount} ₽
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};