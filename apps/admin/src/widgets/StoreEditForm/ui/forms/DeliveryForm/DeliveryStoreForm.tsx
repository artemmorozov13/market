import { Controller, useFormContext } from 'react-hook-form';
import {
  TextField,
  Typography,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import styles from './DeliveryStoreForm.module.scss';
import { FC } from 'react';
import { StoreEditFormType } from '../../../types/storeEditTypes';

export const DeliveryStoreForm: FC = () => {
  const { control, watch } = useFormContext<StoreEditFormType>();
  const isDeliveryFree = watch('isDeliveryFree');

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Настройки доставки
      </Typography>

      <Box className={styles.deliverySettings}>
        <Controller
          name="isDeliveryFree"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  color="primary"
                />
              }
              label="Бесплатная доставка"
            />
          )}
        />

        {!isDeliveryFree && (
          <Controller
            name="deliveryCost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Стоимость доставки"
                type="number"
                fullWidth
                margin="normal"
              />
            )}
          />
        )}

        <Controller
          name="deliveryFreeFromLimit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Бесплатная доставка от (руб)"
              type="number"
              fullWidth
              margin="normal"
            />
          )}
        />
      </Box>
    </section>
  );
};