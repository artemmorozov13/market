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
} from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { adaptOrdersToTable } from "../../lib/adaptOrdersToTable";
import { exportToExcel } from "../../lib/exportToExcel";
import { Row } from "../TableRow/TableRow";
import { exportToWideFormatExcel } from "../../lib/exportToWideFormatExcel";
import { useUpdateOrderStatus } from "../../api/useUpdateOrderStatus";
import { useOrders } from "@pages/OrderTablePage/api/useOrders";
import { useProducts } from "@pages/OrderTablePage/api/useProducts";

import styles from "./OrdersPage.module.scss";

const OrderTablePage: FC = observer(() => {
  const { productsData, isProductsLoading, productsError } = useProducts();
  const { ordersData, isOrdersLoading, ordersError } = useOrders();
  const { updateOrderStatus } = useUpdateOrderStatus();

  const products = productsData?.items || [];
  const orders = ordersData?.items || [];
  const tableOrders = adaptOrdersToTable(orders, products);
  
  const isLoading = isProductsLoading || isOrdersLoading;
  const error = productsError || ordersError;

  const handleStatusUpdate = (orderId: number) => {
    updateOrderStatus(orderId);
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
              onClick={() => exportToExcel({ products, tableOrders })}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (обычный)
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => exportToWideFormatExcel({ products, tableOrders })}
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
                    products={products} 
                    onStatusUpdate={() => handleStatusUpdate(order.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </ShopOwnerLayout>
  );
});

export default OrderTablePage;