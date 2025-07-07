import { FC, useEffect, useState } from "react";
import {
  Box, 
  Typography, 
  Chip, 
  Divider, 
  Paper, 
  Avatar,
  Pagination,
  CircularProgress,
  Breadcrumbs,
  Link
} from "@mui/material";
import { useInView } from 'react-intersection-observer';
import { Layout } from "@/widgets/Layout";
import { observer } from "mobx-react-lite";
import { ProductCard } from "@/entities/Product";
import { userStore } from "@/entities/User";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ProductType } from "@core/types/product-item";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./ProductsPage.module.scss";
import { useBasket, usePushBasketItem, useRemoveBasketItem } from "@/entities/Basket";
import { ManageAddressForm } from "@/features/ManageAddressForm";
import { useStore } from "@/entities/Store";

const PRODUCTS_PER_PAGE = 10;

const ProductsPage: FC = observer(() => {
  const { storeId } = useParams();
  
  const { 
    store,
    isLoading: isStoreLoading,
    isError: isStoreError
  } = useStore(storeId);

  const {
    basket: basketItems = [],
    isLoading: isBasketLoading,
    refetch: refetchBasket
  } = useBasket();

  const [productsPage, setProductsPage] = useState(1);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const { incrementQuantity } = usePushBasketItem();
  const { decrementQuantity } = useRemoveBasketItem();

  useEffect(() => {
    if (inView && store?.products && 
        store.products.length > productsPage * PRODUCTS_PER_PAGE) {
      setProductsPage(prev => prev + 1);
    }
  }, [inView, store, productsPage]);

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

  const selectedProducts = basketItems.map(item => item.productId);
  const isLoading = isStoreLoading || isBasketLoading;
  const visibleProducts = store?.products?.slice(0, productsPage * PRODUCTS_PER_PAGE) || [];

  if (isLoading && !store) {
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

  if (isStoreError) {
    return (
      <Layout className={styles.wrapper}>
        <Box className={styles.container}>
          <Typography variant="h6" className={styles.noStoresText}>
            Произошла ошибка при загрузке магазина
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout className={styles.wrapper}>
      <Box className={styles.container}>
        <ManageAddressForm/>
        {store && (
          <Paper elevation={0} className={styles.storeCard}>
            <Box className={styles.storeHeader}>
              <Avatar 
                src={store.imageUrl || undefined} 
                className={styles.storeAvatar}
                alt={store.name}
              >
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
                  {store.isDeliveryFree ? 'Бесплатная доставка' : 
                   `Доставка: ${store.deliveryCost} ₽`}
                </Typography>
                {store.deliveryFreeFromLimit > 0 && (
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
            </Box>

            <Typography variant="h5" component="h2" className={styles.sectionTitle}>
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
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInBasket={selectedProducts.includes(product.id)}
                      onAddItemBasket={() => handleAddProduct(product)}
                      onRemoveBasketItem={() => handleRemoveProduct(product)}
                    />
                  ))}
                </Box>
                
                {store.products && visibleProducts.length < store.products.length && (
                  <Box ref={ref} className={styles.loadMoreContainer}>
                    <CircularProgress size={24} />
                  </Box>
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