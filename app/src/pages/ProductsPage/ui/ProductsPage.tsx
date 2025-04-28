"use client";

import { FC, useEffect } from "react";
import { 
  Skeleton, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";
import styles from "./ProductsPage.module.scss";
import { useInView } from 'react-intersection-observer';
import { Layout } from "@/widgets/Layout";
import { basketStore, postClearBasket } from "@/entities/Basket";
import { observer } from "mobx-react-lite";
import { ProductCard, ProductType, usePagedProductsList } from "@/entities/Product";
import { userStore } from "@/entities/User";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from "react";
import { RoutePath } from "@/shared/routes/routeConfig";
import { useNavigate } from "react-router";

const PRODUCTS_PER_PAGE = 9;

const ProductsPage: FC = observer(() => {
  const navigate = useNavigate();
  const { user } = userStore;
  const { basketList, totalPrice, totalItems, addItem, removeItem, clearBasket } = basketStore;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddProduct = async (product: ProductType) => {
    const productFromBasket = basketList.find(item => item.productId === product.id)

    if (productFromBasket) {
      await addItem({
        product: product,
        productId: productFromBasket.productId,
        quantity: productFromBasket.quantity + 1,
        userTgchatId: user.user.telegram_id,
        id: user.user.telegram_id,
      });
      return
    }
    await addItem({
      product: product,
      productId: product.id,
      quantity: 1,
      userTgchatId: user.user.telegram_id,
      id: Math.ceil(Math.random() * 99999),
    })
  };

  const handleRemoveProduct = async (product: ProductType) => {
    const basketItem = basketList.find(item => item.productId === product.id)
    if (basketItem) {
      await removeItem(basketItem.id);
    }
  };

  const handleClearBasket = () => {
    postClearBasket()
      .then(() => clearBasket())
    handleMenuClose();
  };

  return (
    <Layout className={styles.wrapper}>
      <AppBar position="sticky" color="default" elevation={1} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Typography variant="h6" component="div" className={styles.title}>
            Фрукты
          </Typography>
          
          <div className={styles.basketControls}>
            {totalItems > 0 && (
              <Typography variant="body1" className={styles.basketTotal}>
                {totalPrice} ₽
              </Typography>
            )}
            
            <Badge 
              badgeContent={totalItems} 
              color="primary"
              className={styles.badge}
            >
              <Button
                variant="contained"
                className={styles.cartButton}
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate(RoutePath.basket)}
              >
                Корзина
              </Button>
            </Badge>
            
            {totalItems > 0 && (
              <>
                <IconButton 
                  aria-label="more"
                  onClick={handleMenuOpen}
                  className={styles.moreButton}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  className={styles.menu}
                >
                  <MenuItem 
                    onClick={handleClearBasket}
                    className={styles.menuItem}
                  >
                    <DeleteIcon className={styles.menuIcon} />
                    Очистить корзину
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={() => navigate(RoutePath.basket)}
                    className={styles.menuItem}
                  >
                    <ArrowForwardIcon className={styles.menuIcon} />
                    Перейти в корзину
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

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
