import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import styles from './StoreCard.module.scss';
import { StoreBaseType } from '@core/types/store-type';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { FC } from 'react';
import { Link } from 'react-router';
import { RoutePath } from '@/shared/routes/routeConfig';

interface StoreCardProps {
    store: StoreBaseType;
}

export const StoreCard: FC<StoreCardProps> = ({ store }) => {
    const defaultImage = 'https://avatars.mds.yandex.net/get-znatoki-cover/907656/2a0000016ce68780019790803fcc031c1d0b/orig';
    
    return (
        <Link
            to={RoutePath.storeById.replace(':storeId', store.id.toString())}
            className={styles.link}
        >
            <Card className={styles.card} elevation={0}>
                <CardActionArea className={styles.actionArea}>
                    <CardMedia
                        component="img"
                        image={store.imageUrl || defaultImage}
                        alt={store.name}
                        className={styles.media}
                    />
                    <CardContent className={styles.content}>
                        <Typography variant="h3" className={styles.title}>
                            {store.name}
                        </Typography>
                        <Typography variant="body2" className={styles.description}>
                            {store.description}
                        </Typography>
                        
                        <Box className={styles.deliveryInfo}>
                            <Box className={styles.deliveryRow}>
                                <LocalShippingIcon fontSize="small" className={styles.icon} />
                                <Typography variant="body2" className={styles.deliveryText}>
                                    {store.isDeliveryFree ? (
                                        <span className={styles.freeDelivery}>Бесплатно</span>
                                    ) : (
                                        `${store.deliveryCost.toFixed()}₽`
                                    )}
                                </Typography>
                                {!store.isDeliveryFree && store.deliveryFreeFromLimit > 0 && (
                                    <Typography variant="caption" className={styles.freeFrom}>
                                        Бесплатно от {store.deliveryFreeFromLimit.toFixed()}&nbsp;₽
                                    </Typography>
                                )}
                            </Box>
                            
                            <Box className={styles.deliveryRow}>
                                <AccessTimeIcon fontSize="small" className={styles.icon} />
                                <Typography variant="body2" className={styles.deliveryText}>
                                    {store.minOrderBeforeDeliveryHours}&nbsp;ч
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Link>
    );
};
