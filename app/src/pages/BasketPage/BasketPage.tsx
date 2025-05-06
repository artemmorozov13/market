"use client";

import { FC, useEffect, useState } from "react";
import { Container, Typography, Button, Box, CircularProgress, Divider } from "@mui/material";
import styles from "./BasketPage.module.scss";
import { observer } from "mobx-react-lite";
import { basketStore } from "@/entities/Basket";
import { Layout } from "@/widgets/Layout";
import { RoutePath } from "@/shared/routes/routeConfig";
import { BasketCard } from "@/entities/Basket/ui/BasketCard/BasketCard";
import { useNavigate } from "react-router";
import { DELIVERY_PRICE } from "@/shared/consts/applicationConsts";

const BasketPage: FC = observer(() => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate= useNavigate();

  const isExpiredProduct = !!basketStore.basketList.find(basketItem => basketItem.product.is_expired)

  useEffect(() => {
    const loadBasketData = async () => {
      try {
        await basketStore.fetchBasketList();
      } catch (error) {
        console.error("Ошибка при загрузке корзины:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBasketData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (basketStore.basketList.length === 0) {
    return (
      <Layout>
        <Container className={styles.emptyContainer}>
          <Typography variant="h5" className={styles.emptyTitle}>
            Ваша корзина пуста
          </Typography>
          <Typography className={styles.emptyText}>
            Добавьте товары из каталога, чтобы сделать заказ
          </Typography>
          <Button
            variant="contained"
            className={styles.emptyButton}
            onClick={() => navigate(RoutePath.products)}
          >
            Перейти в каталог
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h4" className={styles.title}>
            Корзина
          </Typography>
          <Button
            variant="contained"
            className={styles.checkoutButton}
            onClick={() => navigate(RoutePath.order)}
          >
            Оформить заказ
          </Button>
        </Box>

        <Box className={styles.itemsContainer}>
          {basketStore.basketList.map((item) => (
            <BasketCard 
              key={item.productId} 
              item={item} 
              className={styles.basketCard}
            />
          ))}
        </Box>

        <Box className={styles.summary}>
          <Box className={styles.summaryRow}>
            <Typography>Товары ({basketStore.totalItems})</Typography>
            <Typography>{basketStore.totalPrice.toFixed(2)} ₽</Typography>
          </Box>
          <Box className={styles.summaryRow}>
            <Typography>Скидка</Typography>
            <Typography className={styles.discount}>
              {(basketStore.basketList.reduce((acc, item) => {
                const discount = Number(item.product.discount);
                return discount > 0 
                  ? acc + (Number(item.product.price) * item.quantity * discount / 100)
                  : acc;
              }, 0)).toFixed(2)} ₽
            </Typography>
          </Box>
          <Box className={styles.summaryRow}>
            <Typography>Доставка</Typography>
            <Typography>
              {DELIVERY_PRICE}₽
            </Typography>
          </Box>
          <Divider className={styles.divider} />
          <Box className={styles.summaryRow}>
            <Typography variant="h6">Итого</Typography>
            <Typography variant="h6">
              {basketStore.totalPrice + DELIVERY_PRICE}₽
            </Typography>
          </Box>
          <Button
            variant="contained"
            className={styles.checkoutButtonMobile}
            disabled={isExpiredProduct}
            onClick={() => navigate(RoutePath.order)}
          >
            {isExpiredProduct ? "У вас есть товары недоступные для заказа" : "Оформить заказ"}
          </Button>
        </Box>
      </Container>
    </Layout>
  );
});

export default BasketPage;