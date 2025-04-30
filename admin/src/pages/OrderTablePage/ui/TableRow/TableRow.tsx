import { FC, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Button, 
  CircularProgress,
  Collapse,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { OrderedProductType, StatusEnum } from "@entities/Order";
import { TableOrder } from "../../lib/adaptOrdersToTable";

import styles from "./TableRow.module.scss";

interface RowProps {
    order: TableOrder;
    onStatusUpdate: (orderId: number) => void
}
  
export const Row: FC<RowProps> = ({ order, onStatusUpdate }) => {
    const [open, setOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
        await onStatusUpdate(order.id);
        } finally {
        setIsUpdating(false);
        }
    };

    return (
        <>
        <TableRow hover>
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
            {order.status === StatusEnum.Finished ? (
                <Typography color="success.main" fontWeight="bold">Завершен</Typography>
            ) : (
                <Button
                variant="contained"
                color="info"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                size="small"
                >
                {isUpdating ? <CircularProgress size={24} /> : 'Оплачено'}
                </Button>
            )}
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
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