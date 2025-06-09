"use client";

import { FC, useEffect } from "react";
import { Skeleton, Box } from "@mui/material";
import styles from "./ProductsPage.module.scss";
import { useInView } from 'react-intersection-observer';
import { Layout } from "@/widgets/Layout";
import { basketStore } from "@/entities/Basket";
import { observer } from "mobx-react-lite";
import { ProductCard, ProductType, usePagedProductsList } from "@/entities/Product";
import { userStore } from "@/entities/User";

const PRODUCTS_PER_PAGE = 9;

const ProductsPage: FC = observer(() => {
  const { user } = userStore;
  const { basketList, addItem, removeItem } = basketStore;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePagedProductsList({
    take: 10,
    enabled: true
  });

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((page) => page.items) || [];
  const selectedProducts = basketList.map(item => item.productId);

  const handleAddProduct = async (product: ProductType) => {
    const productFromBasket = basketList.find(item => item.productId === product.id)

    if (productFromBasket) {
      await addItem({
        product: product,
        productId: productFromBasket.productId,
        quantity: productFromBasket.quantity + 1,
        userTgchatId: user?.user?.telegram_id,
        id: user?.user?.telegram_id,
      });
      return
    }
    await addItem({
      product: product,
      productId: product.id,
      quantity: 1,
      userTgchatId: user?.user?.telegram_id,
      id: Math.ceil(Math.random() * 99999),
    })
  };

  const handleRemoveProduct = async (product: ProductType) => {
    const basketItem = basketList.find(item => item.productId === product.id)
    if (basketItem) {
      await removeItem(basketItem.id);
    }
  };

  return (
    <Layout className={styles.wrapper}>
      <Box className={styles.container}>
        <Box className={styles.productList}>
            {!products.length ? (
              <span className={styles.noProductsTitle}>Товары закончились, скоро обновим ассортимент :)</span>
            ) : (
              <Box className={styles.grid}>
                {products.map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    isInBasket={selectedProducts.includes(product.id)}
                    onAddItemBasket={handleAddProduct}
                    onRemoveBasketItem={handleRemoveProduct}
                  />
                ))}
              </Box>
            )}

            {isFetchingNextPage && Array.from({ length: PRODUCTS_PER_PAGE }).map((_, idx) => (
              <Box className={styles.grid}>
                <Skeleton key={idx} variant="rectangular" height={200} />
              </Box>
            ))}

          <Box ref={ref} className={styles.refetchBlock} />
        </Box>
      </Box>
    </Layout>
  );
});

export default ProductsPage
