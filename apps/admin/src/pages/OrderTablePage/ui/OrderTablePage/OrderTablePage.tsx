import { FC, useState } from "react";
import { observer } from "mobx-react-lite";
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
} from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { adaptOrdersToTable } from "../../lib/adaptOrdersToTable";
import { Row } from "../TableRow/TableRow";
import { useUpdateOrderStatus } from "../../api/useUpdateOrderStatus";
import { useOrders } from "@pages/OrderTablePage/api/useOrders";
import { useProducts } from "@pages/OrderTablePage/api/useProducts";
import { exportOrdersWithInnerTable } from "../../api/exportOrders";
import { exportOrdersWide } from "../../api/exportOrdersWide";
import { useForm, Controller } from "react-hook-form";
import { usePickupPoints } from "@entities/PickupPoint";

import styles from "./OrdersPage.module.scss";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 0;

type FormValues = {
  pickupPoints: number[]; // Для хранения выбранных пунктов выдачи
};

const OrderTablePage: FC = observer(() => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  
  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      pickupPoints: [],
    },
  });

  // Получаем выбранные пункты выдачи из формы
  const selectedPickupPoints = watch("pickupPoints");
  
  const { data: pickupPoints = [], isLoading: isPickupPointsLoading } = usePickupPoints();
  const { isProductsLoading, productsError } = useProducts();
  const { ordersData, isOrdersLoading, ordersError } = useOrders({
    skip: page * rowsPerPage,
    take: rowsPerPage,
    pickupPointId: selectedPickupPoints.length > 0 ? selectedPickupPoints : undefined,
  });
  
  const { updateOrderStatus } = useUpdateOrderStatus();

  const orders = ordersData?.items || [];
  const totalOrders = ordersData?.pagination?.total || 0;
  const tableOrders = adaptOrdersToTable(orders);
  
  const isLoading = isProductsLoading || isOrdersLoading || isPickupPointsLoading;
  const error = productsError || ordersError;

  const handleStatusUpdate = (orderId: number) => {
    updateOrderStatus(orderId);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ShopOwnerLayout>
      <div className={styles.root}>
        <div className={styles.header}>
          <h1 className={styles.title}>Список заказов</h1>
          <div className={styles.buttonGroup}>
            <Button
              variant="contained" 
              color="primary"
              onClick={() => exportOrdersWithInnerTable(selectedPickupPoints)}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (обычный)
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => exportOrdersWide(selectedPickupPoints)}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (широкий)
            </Button>
          </div>
        </div>

        <div className={styles.filters}>
          <FormControl fullWidth variant="outlined" className={styles.filterControl}>
            <InputLabel>Пункты выдачи</InputLabel>
            <Controller
              name="pickupPoints"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  label="Пункты выдачи"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setPage(0); // Сброс на первую страницу при изменении фильтра
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={pickupPoints.find(p => p.id === value)?.name || value}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {pickupPoints.map((point) => (
                    <MenuItem 
                      key={point.id} 
                      value={point.id}
                    >
                      {point.name} ({point.fullAddress})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </div>
        
        {isLoading ? (
          <div className={styles.loading}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div className={styles.error}>Не удалось загрузить данные. Попробуйте снова.</div>
        ) : (
          <>
            <TableContainer component={Paper} className={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <TableSortLabel>
                        №
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel>
                        Адрес
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Пункт выдачи</TableCell>
                    <TableCell>
                      <TableSortLabel>
                        Приор
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel>
                        Дата доставки
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Время доставки</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Комментарий</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableOrders.map((order) => (
                    <Row
                      key={order.id} 
                      order={order}
                      onStatusUpdate={() => handleStatusUpdate(order.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
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
            />
          </>
        )}
      </div>
    </ShopOwnerLayout>
  );
});

export default OrderTablePage;