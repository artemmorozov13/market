import { FC, useEffect, useState } from "react";
import { Button, Box, Skeleton } from "@mui/material";
import { AddressesSelect, useUpdateSelectedAddress } from "@/entities/Addresses";
import styles from "./ManageAddressForm.module.scss";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import clsx from "clsx";
import { AddNewAddressModal } from "../../AddNewAddressModal";
import { SelectOptionType } from "@/shared/ui/Select/types";

export const ManageAddressForm: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<SelectOptionType | null>(null);
    const { user, isLoading } = useUser();
    const { updateSelectedAddress } = useUpdateSelectedAddress()

    useEffect(() => {
        if (user?.user.selectedAddress) {
            setSelectedAddress({
                value: user.user.selectedAddress.id,
                label: user.user.selectedAddress.fullAddress
            });
        }
    }, [user]);

    const handleAddressChange = (newAddress: SelectOptionType | null) => {
        if (newAddress) {
            setSelectedAddress(newAddress);
            updateSelectedAddress(newAddress.value)
        }
    };

    if (isLoading) {
        return <Skeleton className={clsx(styles.skeleton, styles.fieldSkeleton)} />;
    }

    if (!user?.user.addresses?.length) {
        return (
            <>
                <AddNewAddressModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
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
            </>
        );
    }

    const addressOptions = user.user.addresses.map(address => ({
        value: address.id,
        label: address.fullAddress
    }));

    return (
        <Box className={styles.addressSection}>
            <AddressesSelect
                options={addressOptions}
                value={selectedAddress}
                onChange={handleAddressChange}
                placeholder="Выберите адрес"
            />
            <Button
                variant="outlined"
                onClick={() => setIsOpen(true)}
                sx={{ mt: 2 }}
                fullWidth
            >
                Добавить новый адрес
            </Button>
            <AddNewAddressModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
            />
        </Box>
    );
};