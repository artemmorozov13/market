import { FC, useState } from "react";
import { 
  Card, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  CircularProgress, 
  Badge,
  Button
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { BasketType, basketStore } from "../..";
import { observer } from "mobx-react-lite";
import { ConfirmRemoveFromBasketModal } from "../ConfirmRemoveFromBasketModal/ConfirmRemoveFromBasketModal";
import clsx from "clsx";
import styles from "./BasketCard.module.scss";
import { ProductStatusEnum } from "@core/enums/product-status-enum";

interface BasketItemProps {
  item: BasketType;
  className?: string;
}

const MINIMUM_COUNT_TO_BE_IN_BASKET = 1;

export const BasketCard: FC<BasketItemProps> = observer(({ className, item }) => {
  const { increaseProductCount, decreaseProductCount, clearProduct } = basketStore;

  const [isLoadingAdd, setIsLoadingAdd] = useState<boolean>(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
  
  const hasDiscount = Number(item.product.discount) > 0;
  const originalPrice = Number(item.product.price);
  const discountPercentage = Number(item.product.discount);
  const discountedPrice = hasDiscount 
    ? originalPrice * (1 - discountPercentage / 100)
    : originalPrice;
  
  const totalPrice = Math.ceil(item.quantity * discountedPrice * 100) / 100;
  const totalOriginalPrice = Math.ceil(item.quantity * originalPrice * 100) / 100;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handlePlusProduct = async () => {
    setIsLoadingAdd(true);
    await increaseProductCount(item.productId);
    setIsLoadingAdd(false);
  };

  const handleRemoveProduct = () => {
    clearProduct(item.productId)
  }

  const handleMinusProduct = async () => {
    if (item.quantity === MINIMUM_COUNT_TO_BE_IN_BASKET) {
      setIsOpen(true);
      return;
    }
    setIsLoadingRemove(true);
    await decreaseProductCount(item.productId);
    setIsLoadingRemove(false);
  };

  return (
    <>
      <Card
        className={clsx(styles.card, className, { [styles.disabled]: item.product.status === ProductStatusEnum.Expired })}
        elevation={0}
      >
        <Box className={styles.imageWrapper}>
          <CardMedia
            component="img"
            className={styles.cardMedia}
            image={item.product.image}
            alt={item.product.name}
          />
          {hasDiscount && (
            <Badge 
              badgeContent={`-${discountPercentage}%`} 
              color="error"
              className={styles.discountBadge}
            />
          )}
        </Box>
        
        <Box className={styles.content}>
          <Typography className={styles.itemName} variant="body1">
            {item.product.name}
          </Typography>
          
          {item.product.status === ProductStatusEnum.Expired && (
            <Box className={styles.unavailableBadge}>
              <ErrorOutlineIcon fontSize="small" />
              <Typography variant="caption">Товар недоступен для доставки</Typography>
            </Box>
          )}
          
          <Box className={styles.priceSection}>
            <Box className={styles.priceContainer}>
              <Typography className={styles.currentPrice}>
                {totalPrice.toFixed(2)} ₽
              </Typography>
              {hasDiscount && (
                <Typography className={styles.originalPrice}>
                  {totalOriginalPrice.toFixed(2)} ₽
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box className={styles.quantityControls}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleRemoveProduct}
              disabled={isLoadingRemove}
              className={styles.removeButton}
            >
              Убрать
            </Button>
            
            {item.product.status !== ProductStatusEnum.Expired && (
              <>
                <IconButton
                  className={styles.quantityButton}
                  onClick={handleMinusProduct}
                  disabled={isLoadingRemove}
                  size="small"
                >
                  {isLoadingRemove ? <CircularProgress size={20} /> : <RemoveCircleOutlineIcon />}
                </IconButton>
                
                <Typography className={styles.quantity}>
                  {item.quantity}
                </Typography>
                
                <IconButton
                  className={styles.quantityButton}
                  onClick={handlePlusProduct}
                  disabled={isLoadingAdd}
                  size="small"
                >
                  {isLoadingAdd ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Card>
      
      <ConfirmRemoveFromBasketModal
        basketProduct={item}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
});