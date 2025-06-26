import { FC, useEffect, useState } from "react";
import {
  Box, 
  Typography, 
  Chip, 
  Divider, 
  Paper, 
  Avatar,
  Pagination,
  CircularProgress
} from "@mui/material";
import { useInView } from 'react-intersection-observer';
import { Layout } from "@/widgets/Layout";
import { observer } from "mobx-react-lite";
import { ProductCard } from "@/entities/Product";
import { userStore } from "@/entities/User";
import { useStores } from "@/entities/Store";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ProductType } from "@core/types/product-item";

import styles from "./ProductsPage.module.scss";
import { useBasket, usePushBasketItem, useRemoveBasketItem } from "@/entities/Basket";
import { ManageAddressForm } from "@/features/ManageAddressForm";

const STORES_PER_PAGE = 10;
const PRODUCTS_PER_PAGE = 10;

const ProductsPage: FC = observer(() => {
  const { 
    stores, 
    pagination,
    isLoading: isStoresLoading,
    isFetching: isStoresFetching,
    currentPage
  } = useStores({ 
    page: 1, 
    limit: STORES_PER_PAGE 
  });

  const {
    basket: basketItems = [],
    isLoading: isBasketLoading,
    refetch: refetchBasket
  } = useBasket();

  const [productsPages, setProductsPages] = useState<Record<number, number>>({});
  const { ref, inView } = useInView({ threshold: 0.1 });

  const { incrementQuantity } = usePushBasketItem();
  const { decrementQuantity } = useRemoveBasketItem();

  useEffect(() => {
    if (inView && stores.length > 0) {
      const lastStore = stores[stores.length - 1];
      if (lastStore.products && lastStore.products.length >= (productsPages[lastStore.id] || 1) * PRODUCTS_PER_PAGE) {
        setProductsPages(prev => ({
          ...prev,
          [lastStore.id]: (prev[lastStore.id] || 1) + 1
        }));
      }
    }
  }, [inView, stores, productsPages]);

  const handleAddProduct = async (product: ProductType) => {
    try {
      await incrementQuantity(product.id);
      await refetchBasket();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleRemoveProduct = async (product: ProductType) => {
    try {
      await decrementQuantity(product.id);
      await refetchBasket();
    } catch (error) {
      console.error('Failed to remove product:', error);
    }
  };

  const handleStorePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setProductsPages({});
  };

  const selectedProducts = basketItems.map(item => item.productId);
  const isLoading = isStoresLoading || isBasketLoading;

  if (isLoading && !stores.length) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.loadingContainer}>
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  if (!stores.length && !isStoresFetching) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.container}>
          <Typography variant="h6" className={styles.noStoresText}>
            Нет доступных магазинов
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout className={styles.wrapper}>
      <Box className={styles.container}>
        <Paper className={styles.addressForm}>
          <ManageAddressForm/>
        </Paper>
        {/* {pagination.total > 1 && (
          <Box className={styles.storesPagination}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handleStorePageChange}
              color="primary"
              disabled={isStoresFetching}
            />
          </Box>
        )} */}

        {stores.map(store => {
          const currentPage = productsPages[store.id] || 1;
          const visibleProducts = store.products?.slice(0, currentPage * PRODUCTS_PER_PAGE) || [];
          
          return (
            <Paper key={store.id} elevation={0} className={styles.storeCard}>
              <Box className={styles.storeHeader}>
                <Avatar 
                  src={store.logoUrl || undefined} 
                  className={styles.storeAvatar}
                  alt={store.name}
                >
                  {store.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h1" className={styles.storeName}>
                    {store.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {store.products?.length || 0} товаров
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" className={styles.storeDescription}>
                {store.description}
              </Typography>
              
              <Divider className={styles.divider} />
              
              <Box className={styles.storeDetails}>
                <Box className={styles.detailItem}>
                  <LocalShippingIcon color="primary" />
                  <Typography variant="body2">
                    {store.isDeliveryFree ? 'Бесплатная доставка' : 
                     `Доставка: ${store.deliveryCost} ₽`}
                  </Typography>
                  {store.deliveryFreeFromLimit && (
                    <Chip 
                      label={`Бесплатно от ${store.deliveryFreeFromLimit} ₽`} 
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
                
                <Box className={styles.detailItem}>
                  <MonetizationOnIcon color="primary" />
                  <Typography variant="body2">
                    {store.isWeekLimited ? 'Лимит заказов на неделю' : 'Без лимитов'}
                  </Typography>
                </Box>
              </Box>

              <Box className={styles.productSection}>
                <Typography variant="h6" component="h2" className={styles.sectionTitle}>
                  Товары магазина
                </Typography>
                
                {!visibleProducts.length ? (
                  <Box className={styles.emptyState}>
                    <Typography variant="body1" className={styles.noProductsTitle}>
                      {store.products?.length ? 
                        "Товары закончились, скоро обновим ассортимент :)" : 
                        "В этом магазине пока нет товаров"}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box className={styles.grid}>
                      {visibleProducts.map((product) => {
                        const basketItem = basketItems.find(item => item.productId === product.id);
                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isInBasket={selectedProducts.includes(product.id)}
                            onAddItemBasket={() => handleAddProduct(product)}
                            onRemoveBasketItem={() => handleRemoveProduct(product)}
                          />
                        );
                      })}
                    </Box>
                    
                    {store.products && visibleProducts.length < store.products.length && (
                      <Box ref={ref} className={styles.loadMoreContainer}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Layout>
  );
});

export default ProductsPage;