import React, { FC, useEffect, useState } from "react";
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
  Collapse,
  IconButton,
  Box,
  Typography,
  ButtonGroup
} from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import styles from "./OrdersPage.module.scss";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchProductsData, ProductType } from "@entities/Product";
import { fetchOrderData } from "@entities/Order/api/fetchOrderData";
import { TableOrder, adaptOrdersToTable } from "../lib/adaptOrdersToTable";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { API } from "@shared/api/instance";
import { StatusEnum } from "@entities/Order";

interface RowProps {
  order: TableOrder;
  products: ProductType[];
  onStatusUpdate: (orderId: number) => Promise<void>;
}

const Row: FC<RowProps> = ({ order, products, onStatusUpdate }) => {
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
                  {products.filter(p => order.products[p.id] > 0).map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.price} ₽</TableCell>
                      <TableCell align="right">{order.products[product.id]}</TableCell>
                      <TableCell align="right">{product.discount}%</TableCell>
                      <TableCell align="right">
                        {(parseFloat(product.price) * order.products[product.id] * 
                         (1 - parseFloat(product.discount)/100)).toFixed(2)} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right"><strong>Итого:</strong></TableCell>
                    <TableCell align="right">
                      <strong>
                        {products
                          .reduce((sum, product) => sum + 
                            (parseFloat(product.price) * order.products[product.id] * 
                            (1 - parseFloat(product.discount)/100)), 0)
                          .toFixed(2)} ₽
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

const OrderTablePage: FC = observer(() => {
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetchProductsData({}),
        fetchOrderData({})
      ]);

      setProducts(productsResponse.items);
      const adaptedOrders = adaptOrdersToTable(ordersResponse.items, productsResponse.items);
      setTableOrders(adaptedOrders);
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setError("Не удалось загрузить данные. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateOrderStatus = async (orderId: number) => {
    try {
      const response = await API.post(
        '/order/update-status',
        { orderId }
      )

      if (!response.data) {
        throw new Error('Failed to update status');
      }

      await loadData();
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
      setError("Не удалось обновить статус. Попробуйте снова.");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    setTableOrders(prevOrders => [...prevOrders].sort((a, b) => {
      if (key === 'id' || key === 'priority') {
        return direction === 'asc' 
          ? (a[key] as number) - (b[key] as number)
          : (b[key] as number) - (a[key] as number);
      }
      
      if (key === 'deliveryDate') {
        const aDate = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
        const bDate = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      const aValue = String(a[key as keyof TableOrder]);
      const bValue = String(b[key as keyof TableOrder]);
      
      return direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }));
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    const excelData: any[][] = [];

    // Заголовки
    excelData.push([
      '№ заказа', 
      'Адрес', 
      'Пункт выдачи', 
      'Приоритет', 
      'Дата доставки',
      'Время доставки', 
      'Телефон',
      'Комментарий',
      'Сумма',
      'Статус'
    ]);

    // Данные заказов
    tableOrders.forEach((order) => {
      excelData.push([
        order.id,
        order.fullAddress,
        order.pickupPointName || 'Не указан',
        order.priority,
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("Ru-ru") : 'Не указана',
        order.deliveryTimeRange || 'Не указано',
        order.phone,
        order.comment || 'Нет комментария',
        order.totalAmount + ' ₽',
        order.status === StatusEnum.Finished ? 'Завершен' : 'Оплачено'
      ]);

      // Товары в заказе
      excelData.push([]);
      excelData.push(['', 'Товары в заказе:']);
      excelData.push(['', 'Наименование', 'Цена', 'Количество', 'Скидка', 'Сумма']);

      products.filter(p => order.products[p.id] > 0).forEach(product => {
        excelData.push([
          '',
          product.name,
          product.price + ' ₽',
          order.products[product.id],
          product.discount + '%',
          (parseFloat(product.price) * order.products[product.id] * 
          (1 - parseFloat(product.discount)/100)).toFixed(2) + ' ₽'
        ]);
      });

      excelData.push([]);
    });

    XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: 'A1' });

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(data, `заказы_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportToWideFormatExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    const excelData: any[][] = [];

    // Заголовки
    const headers = [
      '№ заказа', 
      'Адрес', 
      'Пункт выдачи', 
      'Приоритет', 
      'Дата доставки',
      'Время доставки', 
      'Телефон',
      'Комментарий',
      'Сумма',
      'Статус',
      // Добавляем заголовки для всех товаров
      ...products.map(p => p.name)
    ];
    excelData.push(headers);

    // Данные заказов
    tableOrders.forEach((order) => {
      const rowData = [
        order.id,
        order.fullAddress,
        order.pickupPointName || 'Не указан',
        order.priority,
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("Ru-ru") : 'Не указана',
        order.deliveryTimeRange || 'Не указано',
        order.phone,
        order.comment || 'Нет комментария',
        order.totalAmount + ' ₽',
        order.status === StatusEnum.Finished ? 'Завершен' : 'Оплачено',
        // Добавляем количество для каждого товара
        ...products.map(product => 
          order.products[product.id] > 0 ? order.products[product.id] : '-'
        )
      ];
      excelData.push(rowData);
    });
    // Итоговая строка с суммой товаров
    const totalsRow = [
      'Итого', '', '', '', '', '', '', '', '',
      tableOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2) + ' ₽',
      ...products.map(product => 
        tableOrders.reduce((sum, order) => sum + (order.products[product.id] || 0), 0)
      )
    ];
    excelData.push(totalsRow);

    XLSX.utils.sheet_add_aoa(worksheet, excelData, { origin: 'A1' });

    // Настройка ширины колонок
    const colWidths = [
      { wch: 10 },  // № заказа
      { wch: 30 },  // Адрес
      { wch: 20 },  // Пункт выдачи
      { wch: 10 },  // Приоритет
      { wch: 15 },  // Дата доставки
      { wch: 15 },  // Время доставки
      { wch: 15 },  // Телефон
      { wch: 30 },  // Комментарий
      { wch: 15 },  // Сумма
      { wch: 15 },  // Статус
      // Ширина для товаров
      ...products.map(() => ({ wch: 10 }))
    ];
    worksheet['!cols'] = colWidths;

    // Центрирование ячеек
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = { 
            alignment: { 
              horizontal: 'center', 
              vertical: 'center' 
            } 
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы_широкий_формат");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(data, `заказы_широкий_формат_${new Date().toLocaleDateString()}.xlsx`);
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
              onClick={exportToExcel}
              disabled={isLoading || tableOrders.length === 0}
              className={styles.exportButton}
            >
              Экспорт в Excel (обычный)
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={exportToWideFormatExcel}
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
          <div className={styles.error}>{error}</div>
        ) : (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig?.key === 'id'}
                      direction={sortConfig?.key === 'id' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('id')}
                    >
                      №
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig?.key === 'address'}
                      direction={sortConfig?.key === 'address' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('address')}
                    >
                      Адрес
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Пункт выдачи</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig?.key === 'priority'}
                      direction={sortConfig?.key === 'priority' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('priority')}
                    >
                      Приор
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig?.key === 'deliveryDate'}
                      direction={sortConfig?.key === 'deliveryDate' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('deliveryDate')}
                    >
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
                    onStatusUpdate={updateOrderStatus}
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