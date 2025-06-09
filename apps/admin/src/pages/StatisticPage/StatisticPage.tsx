import { OrderType } from "@entities/Order";
import { useOrderStatistic } from "@entities/Statistic";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { FC, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Grid,
  Typography,
  Paper
} from '@mui/material';
import {
  ShoppingCart,
  MonetizationOn,
  Receipt
} from '@mui/icons-material';

import styles from './StatisticPage.module.scss';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const StatisticPage: FC = () => {
  const { orderStatistic } = useOrderStatistic();

  // 1. Статистика по районам (количество заказов)
  const districtStats = useMemo(() => {
    const districts: Record<string, number> = {};

    orderStatistic?.forEach((order: OrderType) => {
      const district = order.pickupPoint?.name || "Неизвестный район";
      districts[district] = (districts[district] || 0) + 1;
    });

    return Object.entries(districts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [orderStatistic]);

  // 2. Статистика по стоимости по районам
  const districtRevenueStats = useMemo(() => {
    const districts: Record<string, number> = {};

    orderStatistic?.forEach((order: OrderType) => {
      const district = order.pickupPoint?.name || "Неизвестный район";
      const amount = parseFloat(order.totalAmount) || 0;
      districts[district] = (districts[district] || 0) + amount;
    });

    return Object.entries(districts).map(([name, revenue]) => ({
      name,
      revenue,
    }));
  }, [orderStatistic]);

  // 3. Статистика по количеству заказанных товаров
  const productQuantityStats = useMemo(() => {
    const quantities: Record<string, number> = {};

    orderStatistic?.forEach((order: OrderType) => {
      order.ordered_products?.forEach((product) => {
        const productId = `${product.product.name}`;
        quantities[productId] = (quantities[productId] || 0) + product.quantity;
      });
    });

    return Object.entries(quantities).map(([name, quantity]) => ({
      name,
      quantity,
    }));
  }, [orderStatistic]);

  // 4. Статистика по статусам заказов
  const orderStatusStats = useMemo(() => {
    const statuses: Record<string, number> = {};

    orderStatistic?.forEach((order: OrderType) => {
      const status = order.status === "finished" ? "Завершен" : "Ожидает оплаты";
      statuses[status] = (statuses[status] || 0) + 1;
    });

    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value,
    }));
  }, [orderStatistic]);

  // 5. Статистика по датам заказов
  const orderDateStats = useMemo(() => {
    const dates: Record<string, number> = {};

    orderStatistic?.forEach((order: OrderType) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      dates[date] = (dates[date] || 0) + 1;
    });

    return Object.entries(dates)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [orderStatistic]);

  return (
    <ShopOwnerLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Статистика заказов за неделю</h1>

        <Paper className={styles.metricsContainer}>
            <Typography variant="h6" component="h2" className={styles.metricsTitle}>
            Ключевые показатели
            </Typography>
            
            <Grid container spacing={3}>
            {/* Всего заказов */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper className={styles.metricCardPrimary}>
                <div className={styles.metricHeader}>
                    <ShoppingCart fontSize="small" className={styles.metricIcon} />
                    <Typography variant="subtitle2">
                    Всего заказов
                    </Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                    {orderStatistic?.length || 0}
                </Typography>
                </Paper>
            </Grid>

            {/* Общая сумма заказов */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper className={styles.metricCardSecondary}>
                <div className={styles.metricHeader}>
                    <MonetizationOn fontSize="small" className={styles.metricIcon} />
                    <Typography variant="subtitle2">
                    Общая сумма
                    </Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                    {orderStatistic?.reduce((sum: number, order: OrderType) => {
                    const amount = parseFloat(order.totalAmount) || 0;
                    return sum + amount;
                    }, 0).toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                    })}
                </Typography>
                </Paper>
            </Grid>

            {/* Средний чек */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper className={styles.metricCardSuccess}>
                <div className={styles.metricHeader}>
                    <Receipt fontSize="small" className={styles.metricIcon} />
                    <Typography variant="subtitle2">
                    Средний чек
                    </Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                    {orderStatistic?.length > 0
                    ? (orderStatistic.reduce((sum: number, order: OrderType) => {
                        const amount = parseFloat(order.totalAmount) || 0;
                        return sum + amount;
                        }, 0) / orderStatistic.length).toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                        })
                    : '0 ₽'}
                </Typography>
                </Paper>
            </Grid>
            </Grid>
        </Paper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* График по районам (количество заказов) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Количество заказов по районам
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Количество заказов" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* График по стоимости по районам */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Сумма заказов по районам
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtRevenueStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" name="Сумма (руб)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Круговая диаграмма по статусам заказов */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Статусы заказов</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatusStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* График по количеству заказанных товаров */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Количество заказанных товаров
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productQuantityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="quantity"
                  fill="#ffc658"
                  name="Количество товаров"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* График по датам заказов */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Динамика заказов по дням
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderDateStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ff8042" name="Заказов в день" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ShopOwnerLayout>
  );
};

export default StatisticPage;