import { FC, useState } from "react";
import { ProductType } from "../types/productTypes";
import { Card, CardContent, CardMedia, Typography, Chip, Box, Divider, Button } from '@mui/material';
import styles from './Product.module.scss';
import { PostNewProductModalForm } from "@features/PostNewProducts";

interface ProductProps {
    product: ProductType;
    handleUpdateProducts: (value: React.SetStateAction<ProductType[]>) => void
}

export const Product: FC<ProductProps> = (props) => {
    const { product, handleUpdateProducts } = props;

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const handleEditProduct = () => {
        setIsEditModalOpen(true);
    };

    const discountedPrice = Number(product.price) * (1 - Number(product.discount) / 100)

    console.log(product.discount)

    return (
        <Card className={styles.productCard}>
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
                className={styles.image}
            />
            <CardContent className={styles.wrapper}>
                <Typography variant="h5" className={styles.name}>
                    {product.name}
                </Typography>

                <Typography variant="body2" color="textSecondary" className={styles.description}>
                    {product.description}
                </Typography>

                <Divider className={styles.divider} />

                <Box display="flex" alignItems="center" gap={1} className={styles.priceSection}>
                    {!!Number(product.discount) ? (
                        <>
                            <Typography variant="body1" className={styles.oldPrice}>
                                {product.price}&nbsp;₽
                            </Typography>
                            <Typography variant="h6" className={styles.newPrice}>
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
                        <Typography variant="h6" className={styles.newPrice}>
                            {product.price}&nbsp;₽
                        </Typography>
                    )}
                </Box>

                <Typography variant="body2" color="textSecondary" className={styles.unit}>
                    Единица измерения: {product.unitValue}{product.unitOfMeasurement}
                </Typography>

                <Divider className={styles.divider} />

                <Box className={styles.actions}>
                    <Button variant="contained" color="primary" onClick={handleEditProduct}>
                        Редактировать
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
