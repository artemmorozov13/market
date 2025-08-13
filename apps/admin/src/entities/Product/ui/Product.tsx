import { FC, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Chip, Box, Divider, Button } from '@mui/material';
import styles from './Product.module.scss';
import { PostNewProductModalForm } from "@features/PostNewProducts";
import { ProductType } from "@core/types/product-item";
import clsx from "clsx";
import { ProductStatusEnum } from "@core/enums/product-status-enum";
import { formatRubbles } from "@core/utils/formatRubbles"

interface ProductProps {
    product: ProductType;
    handleUpdateProduct: (data: ProductType) => void;
    handleDeleteProduct: (productId: number) => void;
    handleRecoverProduct: (productId: number) => void;
    handleRevokeProduct: (productId: number) => void;
}

export const Product: FC<ProductProps> = (props) => {
    const {
        product,
        handleUpdateProduct,
        handleDeleteProduct,
        handleRecoverProduct,
        handleRevokeProduct
    } = props;

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const handleEditProduct = () => {
        setIsEditModalOpen(true);
    };

    const discountedPrice = Number(product.price) * (1 - Number(product.discount) / 100);
    const isExpired = product.status === ProductStatusEnum.Expired;
    const isAccepted = product.status === ProductStatusEnum.Accepted;
    const isRevoked = product.status === ProductStatusEnum.Revoked;
    const hasOfferedPrice = isAccepted && product.offeredPrice;

    const getStatusChip = () => {
        switch (product.status) {
            case ProductStatusEnum.Accepted:
                return <Chip label="Принят" color="success" size="small" />;
            case ProductStatusEnum.Rejected:
                return <Chip label="Отклонён" color="error" size="small" />;
            case ProductStatusEnum.Moderation:
                return <Chip label="На модерации" color="warning" size="small" />;
            case ProductStatusEnum.Expired:
                return <Chip label="Просрочено" color="error" size="small" />;
            case ProductStatusEnum.Revoked:
                return <Chip label="Отозвано" color="default" size="small" />;
            default:
                return null;
        }
    };

    return (
        <Card className={clsx(styles.productCard, { 
            [styles.expired]: isExpired,
            [styles.revoked]: isRevoked
        })}>
            <PostNewProductModalForm
                product={product}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                handleUpdateProduct={handleUpdateProduct}
            />
            
            <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                className={clsx(styles.image, {
                    [styles.expiredImage]: isExpired,
                    [styles.revokedImage]: isRevoked
                })}
            />
            
            <CardContent className={styles.wrapper}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h5" className={styles.name}>
                        {product.name}
                    </Typography>
                    {getStatusChip()}
                </Box>

                <Typography variant="body2" color="textSecondary" className={styles.description}>
                    {product.description}
                </Typography>

                <Divider className={styles.divider} />

                {hasOfferedPrice && (
                    <>
                        <Box className={styles.vendorPriceContainer}>
                            <Typography variant="body2" className={styles.vendorPriceLabel}>
                                Цена поставщика:
                            </Typography>
                            <Typography variant="h6" className={styles.vendorPriceValue}>
                                {formatRubbles(product.offeredPrice)}
                            </Typography>
                        </Box>
                        <Divider className={styles.divider} />
                    </>
                )}

                <Box display="flex" alignItems="center" gap={1} className={styles.priceSection}>
                    {!!Number(product.discount) ? (
                        <>
                            <Typography variant="body1" className={clsx(styles.oldPrice, {
                                [styles.expiredText]: isExpired,
                                [styles.revokedText]: isRevoked
                            })}>
                                {formatRubbles(product.price)}
                            </Typography>
                            <Typography variant="h6" className={clsx(styles.newPrice, {
                                [styles.expiredText]: isExpired,
                                [styles.revokedText]: isRevoked
                            })}>
                                {formatRubbles(discountedPrice)}
                            </Typography>
                            <Chip
                                label={`-${Math.ceil(Number(product.discount))}%`}
                                color="secondary"
                                size="small"
                                className={styles.discountChip}
                            />
                        </>
                    ) : (
                        <Typography variant="h6" className={clsx(styles.newPrice, {
                            [styles.expiredText]: isExpired,
                            [styles.revokedText]: isRevoked
                        })}>
                            {formatRubbles(product.price)}
                        </Typography>
                    )}
                </Box>

                <Typography variant="body2" className={clsx(styles.unit, {
                    [styles.expiredText]: isExpired,
                    [styles.revokedText]: isRevoked
                })}>
                    Единица измерения: {product.unitValue}{product.unitOfMeasurement}
                </Typography>

                <Divider className={styles.divider} />

                <Box className={styles.actions}>
                    {isExpired ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleRecoverProduct(product.id)}
                        >
                            Восстановить
                        </Button>
                    ) : isRevoked ? (
                        <Button
                            variant="outlined" 
                            color="error"
                            onClick={() => handleDeleteProduct(product.id)}
                        >
                            Удалить
                        </Button>
                    ) : isAccepted ? (
                        <>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleRevokeProduct(product.id)}
                                sx={{ mr: 2 }}
                            >
                                Отозвать
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleEditProduct}
                            >
                                Редактировать
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleEditProduct}
                                sx={{ mr: 2 }}
                            >
                                Редактировать
                            </Button>
                            <Button
                                variant="outlined" 
                                color="error"
                                onClick={() => handleDeleteProduct(product.id)}
                            >
                                Удалить
                            </Button>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};