import { useSuppliersList } from "@entities/Supplier";
import { CreateSupplierModal } from "@features/CreateSupplierModal";
import { Box, Button } from "@mui/material";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import { FC, useState } from "react";
import styles from "./SuppliersPage.module.scss"
import { SuppliersList } from "@features/VendorsList/VendorsList";


const SuppliersPage: FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { suppliers } = useSuppliersList()

    const handleAddPartner = () => {
        setIsOpen(true)
    }

    return (
        <ShopOwnerLayout>
            <Box className={styles.header}>
                <Button
                    variant="contained"
                    onClick={handleAddPartner}
                >
                    Добавить партнера
                </Button>
                <CreateSupplierModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </Box>
            <SuppliersList suppliers={suppliers}/>
        </ShopOwnerLayout>
    )
}

export default SuppliersPage
