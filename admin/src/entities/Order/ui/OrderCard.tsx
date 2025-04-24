import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { OrderType } from '../types/orderTypes';
import styles from './OrderCard.module.scss';

interface OrderCardProps {
  order: OrderType;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const calculateProductTotal = (price: string, quantity: number, discount: string) => {
    const priceNumber = parseFloat(price);
    const discountNumber = parseFloat(discount);
    const total = priceNumber * quantity;
    const discountedTotal = total * (1 - discountNumber / 100);
    return { total, discountedTotal };
  };

  const calculateOrderTotal = () => {
    let total = 0;
    let discountedTotal = 0;

    order.ordered_products.forEach((product) => {
      const { total: productTotal, discountedTotal: productDiscountedTotal } =
        calculateProductTotal(
          product.product.price,
          product.quantity,
          product.product.discount
        );
      total += productTotal;
      discountedTotal += productDiscountedTotal;
    });

    return { total, discountedTotal };
  };

  const { total, discountedTotal } = calculateOrderTotal();

  return (
    <Card className={styles.orderCard}>
      <CardContent>
        <Typography variant="h6" component="div" className={styles.orderTitle}>
          Заказ #{order.id}
        </Typography>

        <Typography color="text.secondary" className={styles.orderStatus}>
          Статус: <Chip
            label={order.status}
            color={
              order.status === 'waitForPay'
                ? 'warning'
                : 'success'
            }
          />
        </Typography>

        <Typography variant="body2" className={styles.orderAddress}>
          Адрес доставки: {order.fullAddress}
        </Typography>

        <Typography variant="body2" className={styles.orderAddress}>
          Номер телефона: {order.phoneNumber}
        </Typography>

        <Typography variant="body2" className={styles.userInfo}>
          Пользователь: {order.user.name} (Telegram:{' '}
          <Link
            href={`https://t.me/${order.user.telegram_username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {order.user.telegram_username}
          </Link>)
        </Typography>

        <Typography variant="body2" className={styles.orderDate}>
          Дата создания: {new Date(order.createdAt).toLocaleDateString()}
        </Typography>

        <Accordion defaultExpanded className={styles.productsAccordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="products-content"
            id="products-header"
          >
            <Typography variant="body2" className={styles.productsTitle}>
              Товары ({order.ordered_products.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List className={styles.productsList}>
              {order.ordered_products.map((product) => {
                const { total: productTotal, discountedTotal: productDiscountedTotal } =
                  calculateProductTotal(
                    product.product.price,
                    product.quantity,
                    product.product.discount
                  );

                return (
                  <React.Fragment key={product.id}>
                    <ListItem className={styles.productItem}>
                      <ListItemText
                        primary={product.product.name}
                        secondary={
                          <>
                            <Typography variant="body2" className={styles.productDetail}>
                              Цена: {product.product.price} руб.
                            </Typography>
                            <Typography variant="body2" className={styles.productDetail}>
                              Скидка: {product.product.discount}%
                            </Typography>
                            <Typography variant="body2" className={styles.productDetail}>
                              Количество: {product.quantity}
                            </Typography>
                            <Typography variant="body2" className={styles.productDetail}>
                              Вес: {product.product.unitValue} {product.product.unitOfMeasurement}
                            </Typography>
                            <Typography variant="body2" className={styles.productDetail}>
                              Сумма: {productTotal.toFixed(2)} руб.
                            </Typography>
                            <Typography variant="body2" className={styles.productDetail}>
                              Сумма со скидкой: {productDiscountedTotal.toFixed(2)} руб.
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          </AccordionDetails>
        </Accordion>

        <Typography variant="body2" className={styles.orderTotal}>
          Общая стоимость без скидки: {total.toFixed(2)} руб.
        </Typography>
        <Typography variant="body2" className={styles.orderTotal}>
          Общая стоимость со скидкой: {discountedTotal.toFixed(2)} руб.
        </Typography>
      </CardContent>
    </Card>
  );
};
