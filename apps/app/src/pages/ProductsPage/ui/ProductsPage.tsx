import { FC, useEffect } from "react";
import { Box, Typography, Paper, Avatar, CircularProgress, Divider, Chip } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { Layout } from "@/widgets/Layout";
import { observer } from "mobx-react-lite";
import { ProductCard } from "@/entities/Product";
import { useBasket, usePushBasketItem, useRemoveBasketItem } from "@/entities/Basket";
import { ManageAddressForm } from "@/features/ManageAddressForm";
import { useStore } from "@/entities/Store";
import { formatRubbles } from "@core/utils/formatRubbles";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useParams } from "react-router-dom";
import { useStoreProductsInfinite } from "@/entities/Product/api/fetchProductsByStoreId";
import styles from "./ProductsPage.module.scss";
import { ProductType } from "@core/types/product-item";

const LIMIT = 8;

const ProductsPage: FC = observer(() => {
  const { storeId } = useParams<{ storeId: string }>();
  const { ref, inView } = useInView({ threshold: 0.5 });

  const { store, isLoading: isStoreLoading, isError: isStoreError } = useStore(storeId);
  const { basket: basketItems = [], isLoading: isBasketLoading, refetch: refetchBasket } = useBasket();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isProductsLoading, error: productsError } = useStoreProductsInfinite({
    storeId: Number(storeId),
    limit: LIMIT
  });

  const { incrementQuantity, isLoadingIncrement } = usePushBasketItem();
  const { decrementQuantity, isLoadingDecrement } = useRemoveBasketItem();

  const combinedProducts: ProductType[] = data?.pages.flatMap(page => page.data) ?? [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedProducts = basketItems.map(item => item.productId);
  const isLoadingInitial = isStoreLoading || isBasketLoading || isProductsLoading;

  if (isLoadingInitial && !store) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.loadingContainer}>
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  if (!store && !isStoreLoading) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.container}>
          <Typography variant="h6" className={styles.noStoresText}>
            Магазин не найден
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (isStoreError || productsError) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.container}>
          <Typography variant="h6" className={styles.noStoresText}>
            Произошла ошибка при загрузке данных
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout className={styles.wrapper}>
      <Box className={styles.container}>
        <ManageAddressForm />
        {store && (
          <Paper elevation={0} className={styles.storeCard}>
            <Box className={styles.storeHeader}>
              <Avatar src={store.imageUrl || undefined} className={styles.storeAvatar} alt={store.name}>
                {store.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className={styles.storeName}>
                  {store.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className={styles.storeDescription}>
                  {store.description}
                </Typography>
              </Box>
            </Box>

            <Divider className={styles.divider} />

            <Box className={styles.storeDetails}>
              <Box className={styles.detailItem}>
                <LocalShippingIcon color="primary" />
                <Typography variant="body2">
                  {store.isDeliveryFree
                    ? "Бесплатная доставка"
                    : `Доставка: ${formatRubbles(store.deliveryCost)}`}
                </Typography>
                {store.deliveryFreeFromLimit > 0 && (
                  <Chip
                    label={`Бесплатно от ${formatRubbles(store.deliveryFreeFromLimit)}`}
                    size="small"
                    className={styles.freeDeliveryChip}
                  />
                )}
              </Box>

              <Box className={styles.detailItem}>
                <ScheduleIcon color="primary" />
                <Typography variant="body2">
                  Заказ за {store.minOrderBeforeDeliveryHours} ч до доставки
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" component="h2" className={styles.sectionTitle}>
              Товары магазина
            </Typography>

            {combinedProducts.length === 0 && !isProductsLoading ? (
              <Box className={styles.emptyState}>
                <Typography variant="body1" className={styles.noProductsTitle}>
                  В этом магазине пока нет товаров
                </Typography>
              </Box>
            ) : (
              <>
                <Box className={styles.grid}>
                  {combinedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInBasket={selectedProducts.includes(product.id)}
                      onAddItemBasket={() => incrementQuantity(product.id)}
                      onRemoveBasketItem={() => decrementQuantity(product.id)}
                    />
                  ))}
                </Box>

                {isFetchingNextPage && (
                  <Box className={styles.loadMoreContainer}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {hasNextPage && !isFetchingNextPage && (
                  <Box ref={ref} className={styles.observerTrigger} />
                )}
              </>
            )}
          </Paper>
        )}
      </Box>
    </Layout>
  );
});

export default ProductsPage;
