import { FC, useEffect, useState } from "react";
import { Button, Box, Skeleton, Typography, Chip, Paper } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import styles from "./ManageAddressForm.module.scss";
import clsx from "clsx";
import { AddNewAddressModal } from "../../AddNewAddressModal";
import { SelectOptionType } from "@/shared/ui/Select/types";
import { useUser } from "@/entities/User";
import { AddressType } from "@core/types/address-type";

interface ManageAddressFormProps {
    onAddressChange?: (address: AddressType) => void
}

export const ManageAddressForm: FC<ManageAddressFormProps> = ({ onAddressChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<SelectOptionType | null>(null);
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (user?.selectedAddress) {
            setSelectedAddress({
                value: user.selectedAddress.id,
                label: user.selectedAddress.fullAddress
            });
        }
    }, [user]);

    if (isLoading) {
        return <Skeleton className={clsx(styles.skeleton, styles.fieldSkeleton)} />;
    }

    if (!user?.addresses?.length) {
        return (
            <Paper>
                <AddNewAddressModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onAddressChange={onAddressChange}
                />
                <Box className={styles.emptyAddressSection}>
                    <Button
                        variant="contained"
                        onClick={() => setIsOpen(true)}
                        fullWidth
                    >
                        Добавить адрес
                    </Button>
                </Box>
            </Paper>
        );
    }

    // Находим полный объект адреса для отображения деталей
    const currentAddress = user?.addresses?.find(
        address => address.id === selectedAddress?.value
    ) || user?.addresses?.[0];

    return (
        <Paper>
            <Box className={styles.addressSection}>
                <Box className={styles.wrapper}>
                    <Box className={styles.addressInfo}>
                        <LocationOnIcon color="primary" />
                        <Typography variant="body1">
                            {currentAddress.fullAddress}
                            {currentAddress.apartment && `, кв. ${currentAddress.apartment}`}
                            {currentAddress.entrance && `, подъезд ${currentAddress.entrance}`}
                            {currentAddress.floor && `, этаж ${currentAddress.floor}`}
                        </Typography>
                    </Box>
                    <Chip 
                        label="Изменить" 
                        onClick={() => setIsOpen(true)}
                        variant="filled"

                        size="medium"
                    />
                </Box>
            </Box>
            <AddNewAddressModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                onAddressChange={onAddressChange}
            />
        </Paper>
    );
};
