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
} from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { adaptOrdersToTable } from "../../lib/adaptOrdersToTable";
import { Row } from "../TableRow/TableRow";
import { useUpdateOrderStatus } from "../../api/useUpdateOrderStatus";
import { useOrders } from "@pages/OrderTablePage/api/useOrders";
import { useProducts } from "@pages/OrderTablePage/api/useProducts";
import { exportOrdersWithInnerTable } from "../../api/exportOrders";
import { exportOrdersWide } from "../../api/exportOrdersWide";

import styles from "./OrdersPage.module.scss";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 0;

const OrderTablePage: FC = observer(() => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  
  const { isProductsLoading, productsError } = useProducts();
  const { ordersData, isOrdersLoading, ordersError } = useOrders({
    skip: page * rowsPerPage,
    take: rowsPerPage,
  });
  
  const { updateOrderStatus } = useUpdateOrderStatus();

  const orders = ordersData?.items || [];
  const totalOrders = ordersData?.pagination?.total || 0;
  const tableOrders = adaptOrdersToTable(orders);
  
  const isLoading = isProductsLoading || isOrdersLoading;
  const error = productsError || ordersError;

  const handleStatusUpdate = (orderId: number) => {
    updateOrderStatus(orderId);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Сбрасываем на первую страницу при изменении количества строк
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
              onClick={() => exportOrdersWithInnerTable()}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (обычный)
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => exportOrdersWide()}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (широкий)
            </Button>
          </div>
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

export default OrderTablePage
