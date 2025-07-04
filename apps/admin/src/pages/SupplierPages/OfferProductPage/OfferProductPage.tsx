import { Box, Button } from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { FC, useState } from "react";
import { OfferProductsList } from "@features/OfferProductsList";
import { useCreateOfferedProduct, useOfferedProducts } from "@entities/OfferedProduct";
import { CreateProductModal } from "@features/CreateProductFormModal";
import { ProductFormType } from "@features/PostNewProducts";

import styles from "./OfferProductPage.module.scss"

const OfferProductPage: FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { offeredProducts } = useOfferedProducts()

    const { createOfferedProduct } = useCreateOfferedProduct()

    const handleSubmit = (data: ProductFormType) => {
        createOfferedProduct(data)
        setIsOpen(false)
    }

    const handleOfferProduct = () => {
        setIsOpen(true)
    }

    return (
        <ShopOwnerLayout>
            <CreateProductModal
                isOpen={isOpen}
                onSubmit={handleSubmit}
                onClose={() => setIsOpen(false)}
            />
            <Box className={styles.header}>
                <Button
                    variant="contained"
                    onClick={handleOfferProduct}
                >Предложить товар</Button>
            </Box>
            <OfferProductsList products={offeredProducts} />
        </ShopOwnerLayout>
    )
}

export default OfferProductPage
