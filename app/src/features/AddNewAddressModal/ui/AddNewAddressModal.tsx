import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Typography, Modal, Button } from "@mui/material";
import styles from "./AddNewAddressModal.module.css";
import { putNewAddress } from "../api/putNewAddress";
import { AddressFormSchema } from "../types/addressesTypes";

// Схема валидации
const schema = yup.object().shape({
  city: yup.string().required("Город обязателен").min(2, "Город должен содержать минимум 2 символа"),
  street: yup.string().required("Улица обязательна").min(3, "Улица должна содержать минимум 3 символа"),
  house: yup.string().required("Дом обязателен"),
  entrance: yup.string().required("Подъезд обязателен"),
  floor: yup.string().required("Этаж обязателен"),
  apartment: yup.string().required("Квартира обязательна"),
  intercom: yup.string().required("Домофон обязателен"),
});

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddNewAddressModal: FC<AddNewAddressModalProps> = ({ isOpen, onClose }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      city: "",
      street: "",
      house: "",
      entrance: "",
      floor: "",
      apartment: "",
      intercom: "",
    },
  });

  const onSubmit = (data: AddressFormSchema) => {
    const result = putNewAddress(data)
    if (!!result) {
      onClose()
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <Typography className={styles.title}>Добавить адрес</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.row}>
              <div className={styles.inputField}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Город"
                      variant="outlined"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
              <div className={styles.inputField}>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Улица"
                      variant="outlined"
                      error={!!errors.street}
                      helperText={errors.street?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.inputField}>
                <Controller
                  name="house"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Дом"
                      variant="outlined"
                      error={!!errors.house}
                      helperText={errors.house?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
              <div className={styles.inputField}>
                <Controller
                  name="entrance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Подъезд"
                      variant="outlined"
                      error={!!errors.entrance}
                      helperText={errors.entrance?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.inputField}>
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Этаж"
                      variant="outlined"
                      error={!!errors.floor}
                      helperText={errors.floor?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
              <div className={styles.inputField}>
                <Controller
                  name="apartment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Квартира"
                      variant="outlined"
                      error={!!errors.apartment}
                      helperText={errors.apartment?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.inputField}>
                <Controller
                  name="intercom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Домофон"
                      variant="outlined"
                      error={!!errors.intercom}
                      helperText={errors.intercom?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <Button type="submit" className={styles.button} variant="contained" fullWidth>
              Сохранить адрес
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
