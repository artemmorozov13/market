import { FC, useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Divider,
  IconButton,
  Tabs,
  Tab,
  Paper
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import styles from "./BasketPage.module.scss";
import { observer } from "mobx-react-lite";
import { useBasket, usePushBasketItem, useRemoveBasketItem, useRemoveBasketProduct } from "@/entities/Basket";
import { Layout } from "@/widgets/Layout";
import { RoutePath } from "@/shared/routes/routeConfig";
import { useNavigate } from "react-router";
import { groupBasketData } from "./lib/groupBasketData";
import { userStore } from "@/entities/User";
import { LazyLoadImage } from "react-lazy-load-image-component";

const BasketPage: FC = observer(() => {
  const navigate = useNavigate();

  const { basket, isLoading } = useBasket();
  const { incrementQuantity } = usePushBasketItem()
  const { decrementQuantity } = useRemoveBasketItem();
  const { clearBasketProduct } = useRemoveBasketProduct()

  const { setSelectedStore } = userStore
  const groupedByStore = groupBasketData(basket);
  const storeGroups = groupedByStore ? Object.values(groupedByStore) : [];
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);

  useEffect(() => {
    if (storeGroups.length > 0 && selectedStoreIndex >= storeGroups.length) {
      setSelectedStoreIndex(0);
    }
  }, [storeGroups.length, selectedStoreIndex]);

  // Функция для расчета цены со скидкой
  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const selectedStoreGroup = storeGroups[selectedStoreIndex];

  // Пересчитываем показатели только для выбранного магазина
  const selectedStoreItems = selectedStoreGroup?.items || [];
  
  const totalItemsForSelectedStore = selectedStoreItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Общая стоимость с учетом скидки для выбранного магазина
  const totalPriceForSelectedStore = selectedStoreItems.reduce((acc, item) => {
    const price = Number(item.product.price);
    const discount = Number(item.product.discount) || 0;
    const discountedPrice = discount > 0 ? getDiscountedPrice(price, discount) : price;
    return acc + (discountedPrice * item.quantity);
  }, 0);

  // Общая стоимость без скидки для выбранного магазина
  const totalOriginalPriceForSelectedStore = selectedStoreItems.reduce((acc, item) => {
    const price = Number(item.product.price);
    return acc + (price * item.quantity);
  }, 0);

  const totalDiscountForSelectedStore = totalOriginalPriceForSelectedStore - totalPriceForSelectedStore;

  const deliveryCostForSelectedStore = 
    totalPriceForSelectedStore >= Number(selectedStoreGroup?.store.deliveryFreeFromLimit || 0)
      ? 0 
      : Number(selectedStoreGroup?.store.deliveryCost || 0);

  if (isLoading) {
    return (
      <Layout>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!basket?.length) {
    return (
      <Layout>
        <Container className={styles.emptyContainer}>
          <Box className={styles.emptyImage}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="#ddd">
              <path d="M17 18a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.8 1.03H8.1l-.9 1.63-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1V2m6 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7 2.78-5H6.14l2.36 5H16z"/>
            </svg>
          </Box>
          <Typography className={styles.emptyTitle}>
            Ваша корзина пуста
          </Typography>
          <Typography className={styles.emptyText}>
            Добавьте товары из каталога, чтобы сделать заказ
          </Typography>
          <Button
            variant="contained"
            className={styles.emptyButton}
            onClick={() => navigate(RoutePath.stores)}
          >
            Перейти в каталог
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h4" className={styles.title}>
            Корзина
          </Typography>
          {selectedStoreGroup && (
            <Button
              variant="contained"
              className={styles.checkoutButton}
              onClick={() => navigate(`${RoutePath.order}?storeId=${selectedStoreGroup.store.id}`)}
            >
              Оформить заказ
            </Button>
          )}
        </Box>

        {storeGroups.length > 1 && (
          <Paper className={styles.tabsHeader}>
            <Tabs
              value={selectedStoreIndex}
              onChange={(_, newValue) => {
                setSelectedStoreIndex(newValue)
                setSelectedStore(storeGroups[newValue].store)
              }}
              variant="scrollable"
              scrollButtons="auto"
              className={styles.storeTabs}
            >
              {storeGroups.map((storeGroup, index) => (
                <Tab
                  key={storeGroup.store.id}
                  label={`${storeGroup.store.name} (${storeGroup.items.reduce((acc, item) => acc + item.quantity, 0)})`}
                  className={styles.storeTab}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {selectedStoreGroup && (
          <>
            <Box className={styles.storeGroup}>
              <Typography variant="h6" className={styles.storeTitle}>
                {selectedStoreGroup.store.name}
              </Typography>

              <Box className={styles.itemsContainer}>
                {selectedStoreGroup.items.map((item) => {
                  const price = Number(item.product.price);
                  const discount = Number(item.product.discount) || 0;
                  const discountedPrice = discount > 0 ? getDiscountedPrice(price, discount) : price;
                  const total = discountedPrice * item.quantity;
                  const originalTotal = price * item.quantity;

                  return (
                    <Box key={`${item.productId}-${item.id}`} className={styles.item}>
                      <Box className={styles.itemImage}>
                        <LazyLoadImage 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className={styles.image} 
                        />
                      </Box>
                      <Box className={styles.itemInfo}>
                        <Typography className={styles.itemName}>
                          {item.product.name}
                        </Typography>
                        <Typography className={styles.itemDescription}>
                          {item.product.description}
                        </Typography>
                        <Box className={styles.priceContainer}>
                          {discount > 0 ? (
                            <>
                              <Typography className={styles.discountedPrice}>
                                {price.toFixed()} ₽
                              </Typography>
                              <Typography className={styles.discountBadge}>
                                -{discount}%
                              </Typography>
                            </>
                          ) : (
                            <Typography className={styles.price}>
                              {price.toFixed()} ₽
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box className={styles.quantityControls}>
                        <IconButton 
                          size="small" 
                          className={styles.quantityButton}
                          onClick={() => decrementQuantity(item.productId)}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          className={styles.quantityButton}
                          onClick={() => incrementQuantity(item.productId)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography className={styles.itemTotal}>
                        {total.toFixed()} ₽
                      </Typography>
                      <IconButton 
                        onClick={() => clearBasketProduct(item.productId)}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>

              <Box className={styles.storeSummary}>
                <Box className={styles.summaryRow}>
                  <Typography>Товары ({selectedStoreGroup.items.reduce((acc, item) => acc + item.quantity, 0)})</Typography>
                  <Typography>
                    {selectedStoreGroup.items.reduce((acc, item) => {
                      const price = Number(item.product.price);
                      return acc + (price * item.quantity);
                    }, 0).toFixed()} ₽
                  </Typography>
                </Box>
                {selectedStoreGroup.items.some(item => Number(item.product.discount) > 0) && (
                  <Box className={styles.summaryRow}>
                    <Typography>Скидка</Typography>
                    <Typography className={styles.discount}>
                      -{selectedStoreGroup.items.reduce((acc, item) => {
                        const price = Number(item.product.price);
                        const discount = Number(item.product.discount) || 0;
                        return acc + (price * item.quantity * (discount / 100));
                      }, 0).toFixed()} ₽
                    </Typography>
                  </Box>
                )}
                <Box className={styles.summaryRow}>
                  <Typography>Доставка</Typography>
                  <Typography>
                    {selectedStoreGroup.items.reduce((acc, item) => {
                      const price = Number(item.product.price);
                      const discount = Number(item.product.discount) || 0;
                      const discountedPrice = discount > 0 ? getDiscountedPrice(price, discount) : price;
                      return acc + (discountedPrice * item.quantity);
                    }, 0) >= Number(selectedStoreGroup.store.deliveryFreeFromLimit)
                      ? "Бесплатно"
                      : `${selectedStoreGroup.store.deliveryCost.toFixed()} ₽`}
                  </Typography>
                </Box>
                {selectedStoreGroup.items.reduce((acc, item) => {
                  const price = Number(item.product.price);
                  const discount = Number(item.product.discount) || 0;
                  const discountedPrice = discount > 0 ? getDiscountedPrice(price, discount) : price;
                  return acc + (discountedPrice * item.quantity);
                }, 0) < Number(selectedStoreGroup.store.deliveryFreeFromLimit) && (
                  <Typography className={styles.storeDeliveryNote}>
                    Бесплатная доставка от {selectedStoreGroup.store.deliveryFreeFromLimit.toFixed()} ₽
                  </Typography>
                )}
              </Box>
            </Box>

            <Box className={styles.summary}>
              <Typography variant="h6" className={styles.summaryTitle}>
                Итог заказа
              </Typography>

              <Box className={styles.summaryRow}>
                <Typography>Товары ({totalItemsForSelectedStore})</Typography>
                <Typography>{totalOriginalPriceForSelectedStore.toFixed()} ₽</Typography>
              </Box>

              {totalDiscountForSelectedStore > 0 && (
                <Box className={styles.summaryRow}>
                  <Typography>Скидка</Typography>
                  <Typography className={styles.discount}>
                    -{totalDiscountForSelectedStore.toFixed()} ₽
                  </Typography>
                </Box>
              )}

              <Box className={styles.summaryRow}>
                <Typography>Доставка</Typography>
                <Typography>
                  {deliveryCostForSelectedStore === 0 
                    ? "Бесплатно" 
                    : `${deliveryCostForSelectedStore.toFixed()} ₽`}
                </Typography>
              </Box>

              <Divider className={styles.divider} />

              <Box className={styles.summaryRow}>
                <Typography className={styles.grandTotal}>Итого к оплате</Typography>
                <Typography className={styles.grandTotal}>
                  {(totalPriceForSelectedStore + deliveryCostForSelectedStore).toFixed()} ₽
                </Typography>
              </Box>

              <Button
                variant="contained"
                className={styles.checkoutButtonMobile}
                onClick={() => navigate(`${RoutePath.order}?storeId=${selectedStoreGroup.store.id}`)}
                fullWidth
              >
                Оформить заказ
              </Button>
            </Box>
          </>
        )}
      </div>
    </Layout>
  );
});

export default BasketPage;