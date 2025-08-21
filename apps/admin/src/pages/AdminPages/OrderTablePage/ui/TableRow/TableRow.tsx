import { FC, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Collapse,
  IconButton,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { TableOrder } from '../../lib/adaptOrdersToTable'
import { OrderStatusEnum } from '@core/enums/order-status-enum'

import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum'
import { formatRubbles } from '@core/utils/formatRubbles'

interface RowProps {
  order: TableOrder
  isSelected: boolean
  onSelect: (id: number, isSelected: boolean) => void
}

const disableToChangeStatuses = [
  OrderStatusEnum.CancelByAdmin,
  OrderStatusEnum.CanceledByUser,
  OrderStatusEnum.Finished,
  OrderStatusEnum.FinishedAndRated,
]

const statusLabels: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.Created]: 'Создан',
  [OrderStatusEnum.Confirmed]: 'Подтвержден',
  [OrderStatusEnum.ReadyForDelivery]: 'Готов к отправке',
  [OrderStatusEnum.TransferredToDelivery]: 'Передан курьеру',
  [OrderStatusEnum.OnTheWay]: 'В пути',
  [OrderStatusEnum.Assembly]: 'Готовится к отправке',
  [OrderStatusEnum.WaitForPay]: 'Ожидает оплаты',
  [OrderStatusEnum.Finished]: 'Завершен',
  [OrderStatusEnum.CanceledByUser]: 'Отменен клиентом',
  [OrderStatusEnum.CancelByAdmin]: 'Отменен администратором',
  [OrderStatusEnum.FinishedAndRated]: 'Завершен и оценен',
}

const statusColors: Record<OrderStatusEnum, 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary'> = {
  [OrderStatusEnum.Created]: 'info',
  [OrderStatusEnum.Confirmed]: 'primary',
  [OrderStatusEnum.ReadyForDelivery]: 'info',
  [OrderStatusEnum.TransferredToDelivery]: 'primary',
  [OrderStatusEnum.OnTheWay]: 'warning',
  [OrderStatusEnum.Assembly]: 'info',
  [OrderStatusEnum.WaitForPay]: 'warning',
  [OrderStatusEnum.Finished]: 'success',
  [OrderStatusEnum.CanceledByUser]: 'error',
  [OrderStatusEnum.CancelByAdmin]: 'error',
  [OrderStatusEnum.FinishedAndRated]: 'success',
}

export const Row: FC<RowProps> = ({ order, isSelected, onSelect }) => {
  const [open, setOpen] = useState(false)
  const isPickup = order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(order.id, e.target.checked)
  }

  const renderDeliveryInfo = () => {
    if (isPickup) {
      return (
        <>
          <Typography fontWeight="bold">Тип заказа:</Typography>
          <Chip label="Самовывоз" color="primary" size="small" sx={{ mt: 0.5 }} />
          <Typography fontWeight="bold" mt={1}>
            Пункт выдачи:
          </Typography>
          <Typography>{order?.pickupPoint?.name || order.fullAddress}</Typography>
          <Typography fontWeight="bold" mt={1}>
            Дата получения:
          </Typography>
          <Typography>
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString('Ru-ru')
              : 'Не указана'}
          </Typography>
        </>
      )
    }

    return (
      <>
        <Typography fontWeight="bold">Тип заказа:</Typography>
        <Chip label="Доставка" color="secondary" size="small" sx={{ mt: 0.5 }} />
        <Typography fontWeight="bold" mt={1}>
          Адрес:
        </Typography>
        <Typography>{order.fullAddress}</Typography>
        <Typography fontWeight="bold" mt={1}>
          Дата доставки:
        </Typography>
        <Typography>
          {order.deliveryDate
            ? new Date(order.deliveryDate).toLocaleDateString('Ru-ru')
            : 'Не указана'}
        </Typography>
        <Typography fontWeight="bold" mt={1}>
          Время доставки:
        </Typography>
        <Typography>{order.deliveryTimeRange || 'Не указано'}</Typography>
        {order.deliveryAreaName && (
          <>
            <Typography fontWeight="bold" mt={1}>
              Зона доставки:
            </Typography>
            <Typography>{order.deliveryAreaName}</Typography>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={handleSelect}
            disabled={disableToChangeStatuses.includes(order.status)}
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
        <TableCell>{renderDeliveryInfo()}</TableCell>
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
          {formatRubbles(order.totalAmount)}
        </TableCell>
        <TableCell>
          <Button color={statusColors[order.status]}>{statusLabels[order.status]}</Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
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
                  {order.ordered_products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.product.name}</TableCell>
                      <TableCell align="right">{product.product.price}₽</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">{product.product.discount}%</TableCell>
                      <TableCell align="right">
                        {formatRubbles(
                          Number(product.product.price) *
                            product.quantity *
                            (1 - Number(product.product.discount) / 100),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Итого:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatRubbles(order.totalAmount)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
