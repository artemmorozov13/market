import { FC } from 'react';
import { Button, Modal, Paper, Typography } from '@mui/material';

import styles from './ConfirmRemoveFromBasketModal.module.scss';
import { BasketType, basketStore } from '../..';

interface ConfirmRemoveFromBasketModalProps {
    basketProduct: BasketType
    isOpen: boolean
    onClose: () => void
}

export const ConfirmRemoveFromBasketModal: FC<ConfirmRemoveFromBasketModalProps> = (props) => {
    const { basketProduct, isOpen, onClose } = props;

    const { removeItem } = basketStore

    const handleRemoveFromBasket = () => {
        removeItem(basketProduct.productId)
        onClose()
    }

    const handleSaveInBasket = () => {
        onClose()
    }

    return (
        <Modal open={isOpen} onClose={onClose} className={styles.modal}>
            <Paper className={styles.paper}>
                <Typography variant='h5' className={styles.title}>Убрать из корзины?</Typography>
                <div className={styles.actions}>
                    <Button variant='contained' onClick={handleRemoveFromBasket}>Убрать</Button>
                    <Button variant='outlined' onClick={handleSaveInBasket}>Оставить</Button>
                </div>
            </Paper>
        </Modal>
    );
};