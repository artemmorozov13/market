import { Modal, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, Button } from "@mui/material";
import styles from "./CreateSupplierModal.module.scss";
import { FC } from "react";
import { useCreateSupplier } from "@entities/Supplier";
import { CreateSupplierFormSchema } from "../types/createSupplierFormSchema";
import { createSupplierFormSchema } from "../lib/validationSchema";
import { toast } from "react-toastify";

interface CreateSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateSupplierModal: FC<CreateSupplierModalProps> = (props) => {
    const {
        isOpen,
        onClose,
        onSuccess,
    } = props

    const { createSupplier, isPending } = useCreateSupplier();

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSupplierFormSchema>({
        resolver: yupResolver(createSupplierFormSchema as any),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: CreateSupplierFormSchema) => {
        createSupplier(data, {
            onSuccess: () => {
                onClose();
                reset()
                onSuccess?.();
            },
            onError: () => {
                toast('Ошибка, при создании аккаунта партнера', { type: "error" })
            }
        });
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className={styles.modalContent}>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <Typography variant="h4" className={styles.title}>Добавление партнера</Typography>
                    <Typography variant="body2" className={styles.description}>
                        После создания, партнер сможет зайти под своей ролью и предлагать товары
                    </Typography>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Email"
                                fullWidth
                                type="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Пароль"
                                fullWidth
                                type="password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        )}
                    />

                    <div className={styles.actions}>
                        <Button variant="outlined" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isPending}
                        >
                            {isPending ? "Почти готово..." : "Создать"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
