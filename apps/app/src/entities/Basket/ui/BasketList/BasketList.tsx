import { FC } from 'react';
import { Button, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { BasketCard, useBasket, useClearBasket } from '../..';
import styles from './BasketList.module.scss';
import { RoutePath } from '@/shared/routes/routeConfig';
import { Link } from 'react-router';

export const BasketList: FC = observer(() => {
    const { basket } = useBasket()
    const { clearBasket } = useClearBasket()

    const totalPrice = basket?.reduce((prevValue, currentItem) => (
        prevValue + currentItem.quantity * Number(currentItem.product.price)
    ), 0)
    const totalPriceFixed = totalPrice ?  Math.ceil(totalPrice * 100) / 100 : 0;

    const handleClearBusket = () => {
        clearBasket()
    }

    return (
        <div className={styles.root}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <span className={styles.title}>Корзина</span>
                    <Button
                        variant='text'
                        onClick={handleClearBusket}
                    >Очистить</Button>
                </div>
                {basket?.length ? (
                    <div className={styles.basketList}>
                        {basket.map(basketItem => (
                            <BasketCard
                                key={basketItem.id}
                                item={basketItem}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyBasket}>
                        <Typography variant='h5'>
                            У вас пока пусто :(
                        </Typography>
                    </div>
                )}
                <div className={styles.basketFooter}>
                    <span className={styles.totalPrice}>
                        {totalPriceFixed.toFixed()}&nbsp;₽
                    </span>
                    <Link to={RoutePath.order}>
                        <Button
                            variant='contained'
                            color='info'
                            disabled={!basket?.length}
                        >
                            Заказать
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
});