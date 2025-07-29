import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from "clsx";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import { storeSchema } from '../lib/editStoreSchema';
import { StoreEditFormType } from '../types/storeEditTypes';
import { StoreBaseType } from '@core/types/store-type';
import { useUpdateStore } from '../api/updateStore';
import { useUser } from '@entities/User';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { CheckCircleOutline, FileCopyOutlined } from '@mui/icons-material';
import { useAddStoreStrategy, useRemoveStoreStrategy, useStoreDeliveryStrategies, useStrategies } from '@entities/StoreStrategy';

import styles from './StoreEditForm.module.scss';
import { Uploader } from '@entities/Uploader/ui/Uploader';

interface StoreEditFormProps {
  storeData: StoreBaseType;
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
  const [isCopiedTelegram, setIsCopiedTelegram] = useState(false);
  const [isCopiedBrowser, setIsCopiedBrowser] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<number | ''>('');

  const { data: strategies } = useStrategies();
  const { data: storeStrategies } = useStoreDeliveryStrategies(storeData.id);
  const { mutate: addStrategy } = useAddStoreStrategy(storeData.id);
  const { mutate: removeStrategy } = useRemoveStoreStrategy(storeData.id);
  
  const { mutate: updateStore } = useUpdateStore();
  const { refetch } = useUser();
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<StoreEditFormType>({
    resolver: yupResolver(storeSchema) as any,
    defaultValues: storeData
  });

  const isDeliveryFree = watch('isDeliveryFree');

  const handleCopyMiniAppUrl = () => {
    navigator.clipboard.writeText(`https://t.me/okacuki_bot/?startapp=shop_${storeData.id}`);
    setIsCopiedTelegram(true);
    setTimeout(() => setIsCopiedTelegram(false), 2000);
  };

  const handleCopyBrowserLink = () => {
    navigator.clipboard.writeText(`https://akacuki.ru/app/?store=${storeData.id}`);
    setIsCopiedBrowser(true);
    setTimeout(() => setIsCopiedBrowser(false), 2000);
  };

  const handleAddStrategy = () => {
    if (selectedStrategy) {
      addStrategy(selectedStrategy, {
        onSuccess: () => {
          setSelectedStrategy('');
        }
      });
    }
  };

  const handleRemoveStrategy = (strategyId: number) => {
    removeStrategy(strategyId);
  };

  const onSubmit = async (data: StoreEditFormType) => {
    await updateStore(data);
    refetch();
  };

  const availableStrategies = strategies?.filter(strategy => 
    !storeStrategies?.some(storeStrategy => storeStrategy.strategy.id === strategy.id)
  );

  return (
    <Box className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Основная информация о магазине */}
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
                <Uploader
                  value={value} 
                  onChange={onChange} 
                />
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

        {/* Стратегии доставки */}
        <section className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Стратегии доставки
          </Typography>
          
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Определите доступные способы получения заказов для этого магазина
            </Typography>
            
            {storeStrategies?.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Не выбрано ни одной стратегии доставки. Магазин будет недоступен для заказов.
              </Alert>
            )}
            
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {storeStrategies?.map(storeStrategy => (
                <Chip
                  key={storeStrategy.id}
                  label={storeStrategy.strategy.title}
                  onDelete={() => handleRemoveStrategy(storeStrategy.id)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
            
            {availableStrategies && availableStrategies.length > 0 && (
              <Box display="flex" gap={1} alignItems="center">
                <FormControl sx={{ flexGrow: 1 }}>
                  <InputLabel>Добавить стратегию</InputLabel>
                  <Select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(Number(e.target.value))}
                    label="Добавить стратегию"
                  >
                    {availableStrategies.map(strategy => (
                      <MenuItem key={strategy.id} value={strategy.id}>
                        {strategy.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <IconButton
                  color="primary"
                  onClick={handleAddStrategy}
                  disabled={!selectedStrategy}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
          </Box>
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