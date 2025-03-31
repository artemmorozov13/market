import { FC } from 'react';
import { Button, Modal, Paper } from '@mui/material';

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
                <span className={styles.title}>Убрать из корзины?</span>
                <div className={styles.actions}>
                    <Button variant='contained' color='info' onClick={handleRemoveFromBasket}>Убрать</Button>
                    <Button variant='outlined' color='info' onClick={handleSaveInBasket}>Оставить</Button>
                </div>
            </Paper>
        </Modal>
    );
};