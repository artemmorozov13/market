import { FC } from "react";
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { BasketType } from "@/entities/Basket";
import styles from "./BasketTools.module.scss"
import { observer } from "mobx-react-lite";

interface BasketToolsProps {
    basketItem: BasketType
    totalPrice: number
    isInBasket: boolean
    isLoadingAdd: boolean
    isLoadingRemove: boolean
    handleToggleBasketStatus: () => void | Promise<void>
    handleMinusProduct: () => void | Promise<void>
    handlePlusProduct: () => void | Promise<void>
}

export const BasketTools: FC<BasketToolsProps> = observer((props) => {
    const { basketItem, totalPrice, isInBasket, isLoadingAdd, isLoadingRemove, handleToggleBasketStatus, handleMinusProduct, handlePlusProduct } = props

    return (
        <>
            {isInBasket ? (
                <Box className={styles.basketControls}>
                <Box className={styles.quantityControls}>
                    <Tooltip title="Уменьшить количество">
                    <IconButton
                        size="small"
                        onClick={handleMinusProduct}
                        disabled={isLoadingRemove}
                        className={styles.quantityButton}
                    >
                        {isLoadingRemove ? <CircularProgress size={20} /> : <RemoveCircleOutlineIcon />}
                    </IconButton>
                    </Tooltip>
                    <Typography className={styles.quantityValue}>
                        {basketItem.quantity}
                    </Typography>
                    <Tooltip title="Увеличить количество">
                    <IconButton
                        size="small"
                        onClick={handlePlusProduct}
                        disabled={isLoadingAdd}
                        className={styles.quantityButton}
                    >
                        {isLoadingAdd ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
                    </IconButton>
                    </Tooltip>
                </Box>
                <Typography className={styles.totalPrice}>
                    {`${totalPrice}₽`}
                </Typography>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    size="medium"
                    onClick={handleToggleBasketStatus}
                    disabled={isLoadingAdd || isLoadingRemove}
                    fullWidth
                    startIcon={isLoadingAdd || isLoadingRemove ? <CircularProgress size={16} /> : null}
                >
                    {isLoadingAdd || isLoadingRemove ? "" : "Добавить"}
                </Button>
            )}
        </>
    )
})