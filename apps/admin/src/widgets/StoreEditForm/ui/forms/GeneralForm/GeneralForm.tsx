import { Controller, useFormContext } from 'react-hook-form';
import {
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box
} from '@mui/material';
import { Uploader } from '@entities/Uploader/ui/Uploader';
import styles from './GeneralForm.module.scss';
import { FC } from 'react';
import { StoreEditFormType } from '../../../types/storeEditTypes';

const TIMEZONES = [
  'Europe/Moscow',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'Asia/Tokyo',
  'Asia/Shanghai'
];

export const GeneralForm: FC = () => {
  const { control, formState: { errors } } = useFormContext<StoreEditFormType>();

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Основная информация
      </Typography>

      <Box mb={2}>
        <Typography variant="subtitle1" gutterBottom>
          Изображение магазина
        </Typography>
        <Controller
          name='imageUrl'
          control={control}
          render={({ field: { value, onChange } }) => (
            <Uploader value={value} onChange={onChange} />
          )}
        />
      </Box>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Название магазина"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Описание магазина"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Controller
        name="timezone"
        control={control}
        render={({ field: { value, onChange } }) => (
          <FormControl fullWidth margin="normal">
            <InputLabel id="timezone-label">Часовой пояс магазина</InputLabel>
            <Select
              value={value}
              onChange={onChange}
              labelId="timezone-label"
              label="Часовой пояс магазина"
            >
              {TIMEZONES.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </section>
  );
};