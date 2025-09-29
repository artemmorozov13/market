import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from "clsx"
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from '@mui/material';
import { storeSchema } from '../lib/editStoreSchema';
import { StoreEditFormType } from '../types/storeEditTypes';
import { StoreBaseType } from '@core/types/store-type';
import { useUpdateStore } from '../api/updateStore';
import { useUser } from '@entities/User';

import styles from './StoreEditForm.module.scss';
import { CheckCircleOutline, FileCopyOutlined } from '@mui/icons-material';

interface StoreEditFormProps {
    storeData: StoreBaseType
}

const TIMEZONES = [
    'Europe/Moscow',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'Asia/Tokyo',
    'Asia/Shanghai'
];

export const StoreEditForm: FC<StoreEditFormProps> = ({ storeData }) => {
  const [isCopiedTelegram, setIsCopiedTelegram] = useState<boolean>(false)
  const [isCopiedBrowser, setIsCopiedBrowser] = useState<boolean>(false)
  const { updateStore } = useUpdateStore()
  const { refetch } = useUser({})
  const { control, handleSubmit, watch, formState: { errors } } = useForm<StoreEditFormType>({
    resolver: yupResolver(storeSchema) as any,
    defaultValues: storeData
  });

  const isDeliveryFree = watch('isDeliveryFree');

  const handleCopyMiniAppUrl = () => {
    navigator.clipboard.writeText(`https://t.me/fricti_test_bot/?startapp=shop_${storeData.id}`);
    setIsCopiedTelegram(true);
    setTimeout(() => setIsCopiedTelegram(false), 2000);
  }

  const handleCopyBrowserLink = () => {
    navigator.clipboard.writeText(`https://fruvost.ru/app/?store=${storeData.id}`);
    setIsCopiedBrowser(true);
    setTimeout(() => setIsCopiedBrowser(false), 2000);
  }

  const onSubmit = async (data: StoreEditFormType) => {
    await updateStore(data)
    refetch()
  };

  return (
    <Box className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Основная информация о магазине */}
        <section className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Основная информация
          </Typography>
          
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
            name='timezone'
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

        {/* Настройки доставки */}
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
                    error={!!errors.deliveryCost}
                    helperText={errors.deliveryCost?.message}
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
                  error={!!errors.deliveryFreeFromLimit}
                  helperText={errors.deliveryFreeFromLimit?.message}
                />
              )}
            />
          </Box>
        </section>

        {/* Настройки времени заказа */}
        <section className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Настройки времени заказа
          </Typography>
          
          <Controller
            name="minOrderBeforeDeliveryHours"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Минимальное время до заказа (часы)"
                type="number"
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 24 }}
                helperText="Минимальное количество часов между оформлением заказа и временем доставки"
              />
            )}
          />

          <Controller
            name="isWeekLimited"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    color="primary"
                  />
                }
                label="Ограничить доставку текущей неделей"
                sx={{ mt: 1, mb: 1 }}
              />
            )}
          />
        </section>

        {/* Интеграции */}
        <section className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Интеграции
          </Typography>
          
          <Controller
            name="telegramBotToken"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telegram Bot Token"
                fullWidth
                margin="normal"
                error={!!errors.telegramBotToken}
                helperText={errors.telegramBotToken?.message}
              />
            )}
          />
          
          <Typography variant="subtitle1" className={styles.subsectionTitle}>
            Ссылки для клиентов
          </Typography>
          
          <div className={styles.buttonGroup}>
            <Button
                onClick={handleCopyMiniAppUrl}
                className={clsx(styles.copyButton, { [styles.copied]: isCopiedTelegram })}
                startIcon={isCopiedTelegram ? <CheckCircleOutline /> : <FileCopyOutlined />}
                variant="contained"
                color="primary"
                fullWidth
            >
                {isCopiedTelegram ? "Скопировано!" : "Скопировать ссылку для Telegram Mini App"}
            </Button>
            <Button
                onClick={handleCopyBrowserLink}
                className={clsx(styles.copyButton, { [styles.copied]: isCopiedBrowser })}
                startIcon={isCopiedBrowser ? <CheckCircleOutline /> : <FileCopyOutlined />}
                variant="contained"
                color="primary"
                fullWidth
            >
                {isCopiedBrowser ? "Скопировано!" : "Скопировать ссылку для браузера"}
            </Button>
          </div>
        </section>

        <Box className={styles.actions}>
          <Button
            className={styles.saveButton}
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Сохранить изменения
          </Button>
        </Box>
      </form>
    </Box>
  );
};