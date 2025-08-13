import { FC } from "react";
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import styles from "./BasketTools.module.scss"
import { observer } from "mobx-react-lite";
import { BasketBaseType } from "@core/types/basket-tipe";
import { formatRubbles } from "@core/utils/formatRubbles";

interface BasketToolsProps {
    basketItem: BasketBaseType
    className?: string
    totalPrice: number
    isInBasket: boolean
    isLoadingAdd: boolean
    isLoadingRemove: boolean
    handleToggleBasketStatus: () => void | Promise<void>
    handleMinusProduct: () => void | Promise<void>
    handlePlusProduct: () => void | Promise<void>
}

export const BasketTools: FC<BasketToolsProps> = observer((props) => {
    const { basketItem, totalPrice, isInBasket, isLoadingAdd, isLoadingRemove, className, handleToggleBasketStatus, handleMinusProduct, handlePlusProduct } = props

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
                        {basketItem?.quantity}
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
                    {formatRubbles(totalPrice)}
                </Typography>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    size="medium"
                    onClick={handleToggleBasketStatus}
                    disabled={isLoadingAdd || isLoadingRemove}
                    className={className}
                    fullWidth
                    startIcon={isLoadingAdd || isLoadingRemove ? <CircularProgress size={16} /> : null}
                >
                    {isLoadingAdd || isLoadingRemove ? "Кладем..." : "Добавить"}
                </Button>
            )}
        </>
    )
})