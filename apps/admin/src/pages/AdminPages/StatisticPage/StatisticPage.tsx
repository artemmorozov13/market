import { OrderType } from '@entities/Order'
import { useOrderStatistic } from '@entities/Statistic'
import { ShopOwnerLayout } from '@widgets/ShopOwnerLayout'
import { FC, useMemo } from 'react'
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
} from 'recharts'
import { Grid, Typography, Paper, Chip } from '@mui/material'
import { ShoppingCart, MonetizationOn, Receipt, LocalShipping, Store } from '@mui/icons-material'
import { OrderStatusEnum } from '@core/enums/order-status-enum'
import styles from './StatisticPage.module.scss'
import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

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

const StatisticPage: FC = () => {
  const { orderStatistic } = useOrderStatistic()

  // 1. Статистика по типам доставки
  const deliveryTypeStats = useMemo(() => {
    const types: Record<string, number> = {
      [DeliveryStrategyEnum.DeliveryToEntrance]: 0,
      [DeliveryStrategyEnum.PickupByYourself]: 0,
    }

    orderStatistic?.forEach((order: OrderType) => {
      const type = order.orderDeliveryStrategy
      if (type in types) {
        types[type]++
      }
    })

    return Object.entries(types).map(([name, count]) => ({
      name: name === DeliveryStrategyEnum.DeliveryToEntrance ? 'Доставка' : 'Самовывоз',
      count,
      color: name === DeliveryStrategyEnum.DeliveryToEntrance ? '#4caf50' : '#3f51b5',
    }))
  }, [orderStatistic])

  // 2. Статистика по районам (количество заказов)
  const districtStats = useMemo(() => {
    const districts: Record<string, number> = {}

    orderStatistic?.forEach((order: OrderType) => {
      let district = 'Не указан'
      if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        district = order.deliveryArea?.name || 'Доставка (без района)'
      } else if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        district = order.pickupPoint?.name || 'Самовывоз (без пункта)'
      }
      districts[district] = (districts[district] || 0) + 1
    })

    return Object.entries(districts).map(([name, count]) => ({
      name,
      count,
    }))
  }, [orderStatistic])

  // 3. Статистика по стоимости по районам
  const districtRevenueStats = useMemo(() => {
    const districts: Record<string, number> = {}

    orderStatistic?.forEach((order: OrderType) => {
      let district = 'Не указан'
      if (order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance) {
        district = order.deliveryArea?.name || 'Доставка (без района)'
      } else if (order.orderDeliveryStrategy === DeliveryStrategyEnum.PickupByYourself) {
        district = order.pickupPoint?.name || 'Самовывоз (без пункта)'
      }
      const amount = parseFloat(order.totalAmount) || 0
      districts[district] = (districts[district] || 0) + amount
    })

    return Object.entries(districts).map(([name, revenue]) => ({
      name,
      revenue,
    }))
  }, [orderStatistic])

  // 4. Статистика по количеству заказанных товаров
  const productQuantityStats = useMemo(() => {
    const quantities: Record<string, number> = {}

    orderStatistic?.forEach((order: OrderType) => {
      order.ordered_products?.forEach((product) => {
        const productId = `${product.product.name}`
        quantities[productId] = (quantities[productId] || 0) + product.quantity
      })
    })

    return Object.entries(quantities).map(([name, quantity]) => ({
      name,
      quantity,
    }))
  }, [orderStatistic])

  // 5. Статистика по статусам заказов
  const orderStatusStats = useMemo(() => {
    const statuses: Record<string, number> = {}

    orderStatistic?.forEach((order: OrderType) => {
      const status = statusLabels[order.status] || order.status
      statuses[status] = (statuses[status] || 0) + 1
    })

    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value,
    }))
  }, [orderStatistic])

  // 6. Статистика по датам заказов
  const orderDateStats = useMemo(() => {
    const dates: Record<string, number> = {}

    orderStatistic?.forEach((order: OrderType) => {
      const date = new Date(order.createdAt).toLocaleDateString()
      dates[date] = (dates[date] || 0) + 1
    })

    return Object.entries(dates)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
  }, [orderStatistic])

  // 7. Общая статистика
  const totalOrders = orderStatistic?.length || 0
  const totalRevenue =
    orderStatistic?.reduce(
      (sum: number, order: OrderType) => sum + parseFloat(order.totalAmount || '0'),
      0,
    ) || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const deliveryOrders = deliveryTypeStats.find((t) => t.name === 'Доставка')?.count || 0
  const pickupOrders = deliveryTypeStats.find((t) => t.name === 'Самовывоз')?.count || 0

  return (
    <ShopOwnerLayout>
      <div className={styles.container}>
        <Typography variant="h4" className={styles.title}>
          Статистика заказов
        </Typography>

        <Paper className={styles.metricsContainer}>
          <Typography variant="h6" component="h2" className={styles.metricsTitle}>
            Ключевые показатели
          </Typography>

          <Grid container spacing={3}>
            {/* Всего заказов */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={styles.metricCardPrimary}>
                <div className={styles.metricHeader}>
                  <ShoppingCart fontSize="small" className={styles.metricIcon} />
                  <Typography variant="subtitle2">Всего заказов</Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                  {totalOrders}
                </Typography>
              </Paper>
            </Grid>

            {/* Общая сумма заказов */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={styles.metricCardSecondary}>
                <div className={styles.metricHeader}>
                  <MonetizationOn fontSize="small" className={styles.metricIcon} />
                  <Typography variant="subtitle2">Общая сумма</Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                  {totalRevenue.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Paper>
            </Grid>

            {/* Средний чек */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={styles.metricCardSuccess}>
                <div className={styles.metricHeader}>
                  <Receipt fontSize="small" className={styles.metricIcon} />
                  <Typography variant="subtitle2">Средний чек</Typography>
                </div>
                <Typography variant="h4" className={styles.metricValue}>
                  {avgOrderValue.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Paper>
            </Grid>

            {/* Типы доставки */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={styles.metricCardInfo}>
                <div className={styles.metricHeader}>
                  <LocalShipping fontSize="small" className={styles.metricIcon} />
                  <Typography variant="subtitle2">Типы доставки</Typography>
                </div>
                <div className={styles.deliveryTypes}>
                  <Chip
                    icon={<LocalShipping />}
                    label={`Доставка: ${deliveryOrders}`}
                    color="success"
                    variant="outlined"
                    className={styles.deliveryChip}
                  />
                  <Chip
                    icon={<Store />}
                    label={`Самовывоз: ${pickupOrders}`}
                    color="primary"
                    variant="outlined"
                    className={styles.pickupChip}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} className={styles.chartsContainer}>
          {/* График по типам доставки */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Распределение по типам доставки
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deliveryTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* График по статусам заказов */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Статусы заказов
              </Typography>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* График по районам (количество заказов) */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Количество заказов по районам/пунктам
              </Typography>
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
            </Paper>
          </Grid>

          {/* График по стоимости по районам */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Сумма заказов по районам/пунктам
              </Typography>
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
            </Paper>
          </Grid>

          {/* График по количеству заказанных товаров */}
          <Grid item xs={12}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Количество заказанных товаров
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productQuantityStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#ffc658" name="Количество товаров" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* График по датам заказов */}
          <Grid item xs={12}>
            <Paper className={styles.chartPaper}>
              <Typography variant="h6" className={styles.chartTitle}>
                Динамика заказов по дням
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={orderDateStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ff8042" name="Заказов в день" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </ShopOwnerLayout>
  )
}

export default StatisticPage
