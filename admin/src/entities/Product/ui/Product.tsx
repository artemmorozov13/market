import { FC, useState } from "react";
import { ProductType } from "../types/productTypes";
import { Card, CardContent, CardMedia, Typography, Chip, Box, Divider, Button, Badge } from '@mui/material';
import styles from './Product.module.scss';
import { PostNewProductModalForm } from "@features/PostNewProducts";
import { deleteProduct } from "../api/deleteProduct";
import { recoverProduct } from "../api/recoverProduct";

interface ProductProps {
    product: ProductType;
    handleUpdateProducts: (value: React.SetStateAction<ProductType[]>) => void;
}

export const Product: FC<ProductProps> = (props) => {
    const { product, handleUpdateProducts } = props;
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const handleEditProduct = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteProduct = async () => {
        try {
            await deleteProduct(product.id);
            handleUpdateProducts(prev => prev.map(p => {
                if (p.id === product.id) {
                    return { ...p, is_expired: true };
                }
                return p;
            }));
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleRecoverProduct = async () => {
        await recoverProduct(product.id)
        handleUpdateProducts(prev => prev.map(p => {
            if (p.id === product.id) {
                return { ...p, is_expired: false };
            }
            return p;
        }));
    }

    const discountedPrice = Number(product.price) * (1 - Number(product.discount) / 100);

    return (
        <Card className={`${styles.productCard} ${product.is_expired ? styles.expired : ''}`}>
            <PostNewProductModalForm
                product={product}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                handleUpdateProducts={handleUpdateProducts}
            />
            <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                className={`${styles.image} ${product.is_expired ? styles.expiredImage : ''}`}
            />
            <CardContent className={styles.wrapper}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h5" className={styles.name}>
                        {product.name}
                    </Typography>
                    {product.is_expired && (
                        <Chip
                            label="Просрочено"
                            color="error"
                            size="small"
                            className={styles.expiredChip}
                        />
                    )}
                </Box>

                <Typography variant="body2" color="textSecondary" className={styles.description}>
                    {product.description}
                </Typography>

                <Divider className={styles.divider} />

                <Box display="flex" alignItems="center" gap={1} className={styles.priceSection}>
                    {!!Number(product.discount) ? (
                        <>
                            <Typography variant="body1" className={`${styles.oldPrice} ${product.is_expired ? styles.expiredText : ''}`}>
                                {product.price}&nbsp;₽
                            </Typography>
                            <Typography variant="h6" className={`${styles.newPrice} ${product.is_expired ? styles.expiredText : ''}`}>
                                {discountedPrice.toFixed(2)}&nbsp;₽
                            </Typography>
                            <Chip
                                label={`-${Math.ceil(Number(product.discount))}%`}
                                color="secondary"
                                size="small"
                                className={styles.discountChip}
                            />
                        </>
                    ) : (
                        <Typography variant="h6" className={`${styles.newPrice} ${product.is_expired ? styles.expiredText : ''}`}>
                            {product.price}&nbsp;₽
                        </Typography>
                    )}
                </Box>

                <Typography variant="body2" className={`${styles.unit} ${product.is_expired ? styles.expiredText : ''}`}>
                    Единица измерения: {product.unitValue}{product.unitOfMeasurement}
                </Typography>

                <Divider className={styles.divider} />

                <Box className={styles.actions}>
                    {!product.is_expired ? (
                        <>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleEditProduct}
                                sx={{ mr: 2 }}
                                disabled={product.is_expired}
                            >
                                Редактировать
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={handleDeleteProduct}
                            >Удалить</Button>
                        </>
                    ) : (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleRecoverProduct}
                            sx={{ mr: 2 }}
                        >
                            Востановить
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};