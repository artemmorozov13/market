import { FC, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Button,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Checkbox,
  Typography,
} from '@mui/material'
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout'
import { adaptOrdersToTable } from '../../lib/adaptOrdersToTable'
import { Row } from '../TableRow/TableRow'
import { useUpdateOrderStatus } from '../../api/useUpdateOrderStatus'
import { useOrders } from '@pages/AdminPages/OrderTablePage/api/useOrders'
import { exportOrdersWide } from '../../api/exportOrdersWide'
import { useForm, Controller } from 'react-hook-form'
import { useDeliveryAreas } from '@entities/DeliveryArea'
import { OrderStatusEnum } from '@core/enums/order-status-enum'
import styles from './OrdersPage.module.scss'
import { ChangeOrderStatusModal } from '@features/ChangeOrderStatus'
import { ChangeStatusFormValues } from '@features/ChangeOrderStatus/lib/schema'
import { useProducts } from '@entities/Product'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE = 0

type FormValues = {
  deliveryAreas: number[]
}

const disableToChangeStatuses = [
  OrderStatusEnum.CancelByAdmin,
  OrderStatusEnum.CanceledByUser,
  OrderStatusEnum.Finished,
  OrderStatusEnum.FinishedAndRated,
]

const OrderTablePage: FC = observer(() => {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      deliveryAreas: [],
    },
  })

  const selectedDeliveryAreas = watch('deliveryAreas')

  const { data: deliveryAreas = [], isLoading: isDeliveryAreasLoading } = useDeliveryAreas()
  const { isProductsLoading, productsError } = useProducts()
  const { ordersData, isOrdersLoading, ordersError } = useOrders({
    skip: page * rowsPerPage,
    take: rowsPerPage,
    deliveryAreaId: selectedDeliveryAreas.length > 0 ? selectedDeliveryAreas : undefined,
  })

  const { updateOrderStatus } = useUpdateOrderStatus()

  const orders = ordersData?.items || []
  const totalOrders = ordersData?.pagination?.total || 0
  const tableOrders = adaptOrdersToTable(orders)

  const isLoading = isProductsLoading || isOrdersLoading || isDeliveryAreasLoading
  const error = productsError || ordersError

  const handleSelectOrder = (orderId: number, isSelected: boolean) => {
    setSelectedOrders((prev) =>
      isSelected ? [...prev, orderId] : prev.filter((id) => id !== orderId),
    )
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const selectableOrders = tableOrders
        .filter((order) => disableToChangeStatuses.includes(order.status))
        .map((order) => order.id)
      setSelectedOrders(selectableOrders)
    } else {
      setSelectedOrders([])
    }
  }

  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true)
  }

  const handleStatusSubmit = async (values: ChangeStatusFormValues) => {
    if (values.status) {
      await updateOrderStatus({
        orderIds: selectedOrders,
        status: values.status,
        cancelReason: values.cancelReason,
      })
      setStatusDialogOpen(false)
      setSelectedOrders([])
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
    setSelectedOrders([])
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setSelectedOrders([])
  }

  const numSelectableOrders = tableOrders.filter(
    (order) => !disableToChangeStatuses.includes(order.status),
  ).length

  const numSelected = selectedOrders.length
  const allSelected = numSelected > 0 && numSelected === numSelectableOrders

  return (
    <ShopOwnerLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Список заказов</h1>
        <div className={styles.buttonGroup}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => exportOrdersWide(selectedDeliveryAreas)}
            disabled={isLoading || tableOrders.length === 0}
            className={styles.exportButton}
          >
            Экспорт Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenStatusDialog}
            disabled={selectedOrders.length === 0}
            className={styles.statusButton}
          >
            Изменить статус ({selectedOrders.length})
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <FormControl fullWidth variant="outlined" className={styles.filterControl}>
          <InputLabel>Зоны доставки</InputLabel>
          <Controller
            name="deliveryAreas"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                label="Зоны доставки"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value)
                  setPage(0)
                  setSelectedOrders([])
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((value) => (
                      <Chip
                        key={value}
                        label={deliveryAreas.find((p) => p.id === value)?.name || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {deliveryAreas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name} ({area.fullAddress})
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <CircularProgress size={60} />
        </div>
      ) : error ? (
        <div className={styles.error}>
          <Typography color="error" variant="h6">
            Ошибка загрузки данных
          </Typography>
          <Typography color="textSecondary">
            {error.message || 'Попробуйте обновить страницу'}
          </Typography>
        </div>
      ) : (
        <>
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table stickyHeader aria-label="orders table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width={50}>
                    <Checkbox
                      indeterminate={numSelected > 0 && numSelected < numSelectableOrders}
                      checked={allSelected}
                      onChange={handleSelectAll}
                      disabled={numSelectableOrders === 0}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell width={50} />
                  <TableCell width={80}>
                    <TableSortLabel>№</TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel>Информация о заказе</TableSortLabel>
                  </TableCell>
                  <TableCell width={150}>
                    <TableSortLabel>Телефон</TableSortLabel>
                  </TableCell>
                  <TableCell width={200}>
                    <TableSortLabel>Комментарий</TableSortLabel>
                  </TableCell>
                  <TableCell width={120}>
                    <TableSortLabel>Сумма</TableSortLabel>
                  </TableCell>
                  <TableCell width={200}>
                    <TableSortLabel>Статус</TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableOrders.length > 0 ? (
                  tableOrders.map((order) => (
                    <Row
                      key={order.id}
                      order={order}
                      isSelected={selectedOrders.includes(order.id)}
                      onSelect={handleSelectOrder}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="textSecondary">
                        Нет заказов по выбранным критериям
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {tableOrders.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalOrders}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
              }
              className={styles.pagination}
            />
          )}

          <ChangeOrderStatusModal
            onClose={() => setStatusDialogOpen(false)}
            onSubmit={handleStatusSubmit}
            open={statusDialogOpen}
            selectedCount={numSelected}
          />
        </>
      )}
    </ShopOwnerLayout>
  )
})

export default OrderTablePage
