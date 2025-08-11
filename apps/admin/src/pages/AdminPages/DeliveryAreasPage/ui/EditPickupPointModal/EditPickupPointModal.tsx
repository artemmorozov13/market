import { FC, useState, useEffect, useMemo } from 'react';
import { Control, Controller, UseFormSetValue, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { DeliveryTimeFormData, DeliveryAreaFormData } from '../../types/types';
import { dayOptions, timeOptions } from '../../consts/intervals';
import { useAddressSuggestions } from '@features/AddressSearchField';
import { AddressSearchField } from '@features/AddressSearchField/ui/AddressSearchField';
import { DeliveryArea } from '@entities/DeliveryArea';
import styles from './EditPickupPointModal.module.scss'

interface EditDeliveryAreaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  control: Control<DeliveryAreaFormData>;
  setValue: UseFormSetValue<DeliveryAreaFormData>;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  selectedPoint: DeliveryArea | null;
}

export const EditDeliveryAreaModal: FC<EditDeliveryAreaModalProps> = ({
  open,
  onClose,
  onSubmit,
  setValue,
  control,
  errors,
  isSubmitting,
  isEditing,
  selectedPoint,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliveryTimes',
  });

  const groupByDay = () => {
    const grouped: Record<string, DeliveryTimeFormData[]> = {};
    
    fields.forEach(field => {
      const day = field.dayOfWeek.value;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(field);
    });
    
    return grouped;
  };

  const groupedTimes = groupByDay();

  // Компонент для выбора временного интервала
  const TimeRangePicker = ({ day }: { day: string }) => {
    const [startTime, setStartTime] = useState(timeOptions[9]);
    const [endTime, setEndTime] = useState(timeOptions[11]);
    const [error, setError] = useState('');

    const dayOption = dayOptions.find(d => d.value === day);
    const existingIntervals = groupedTimes[day] || [];

    const handleAddInterval = () => {
      // Проверка на пересечение с существующими интервалами
      const isOverlapping = existingIntervals.some(interval => {
        return (
          (startTime.value >= interval.startTime.value && startTime.value < interval.endTime.value) ||
          (endTime.value > interval.startTime.value && endTime.value <= interval.endTime.value) ||
          (startTime.value <= interval.startTime.value && endTime.value >= interval.endTime.value)
        );
      });

      if (isOverlapping) {
        setError('Этот интервал пересекается с существующим');
        return;
      }

      if (startTime.value >= endTime.value) {
        setError('Время окончания должно быть позже времени начала');
        return;
      }

      append({
        dayOfWeek: dayOption!,
        startTime,
        endTime
      });

      // Сброс состояния
      setStartTime(timeOptions[9]);
      setEndTime(timeOptions[11]);
      setError('');
    };

    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl fullWidth>
          <Autocomplete
            options={timeOptions}
            getOptionLabel={(option) => option.label}
            value={startTime}
            onChange={(_, newValue) => {
              if (newValue) {
                setStartTime(newValue);
                // Автоматически устанавливаем конечное время (+2 часа)
                const startIndex = timeOptions.findIndex(opt => opt.value === newValue.value);
                const endIndex = Math.min(startIndex + 4, timeOptions.length - 1);
                setEndTime(timeOptions[endIndex]);
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Начало" fullWidth />
            )}
          />
        </FormControl>
        
        <Typography>—</Typography>
        
        <FormControl fullWidth>
          <Autocomplete
            options={timeOptions.filter(opt => opt.value > startTime.value)}
            getOptionLabel={(option) => option.label}
            value={endTime}
            onChange={(_, newValue) => {
              if (newValue) setEndTime(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Конец" fullWidth />
            )}
          />
        </FormControl>
        
        <Button 
          variant="contained" 
          onClick={handleAddInterval}
          startIcon={<AddIcon />}
          className={styles.addButton}
          fullWidth
        >
          Добавить
        </Button>

        {error && (
          <Typography color="error" variant="body2" sx={{ ml: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Редактировать зону доставки' : 'Добавить новую зону доставки'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">Основная информация</Typography>
            
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Название обязательно' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Название зоны доставки"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="radius"
              control={control}
              rules={{ 
                required: 'Радиус обязателен',
                min: { value: 1, message: 'Радиус должен быть больше 0' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Радиус доставки (метры)"
                  fullWidth
                  error={!!errors.radius}
                  helperText={errors.radius?.message}
                />
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field: { value } }) => (
                <AddressSearchField
                  control={control}
                  value={value}
                  name="address"
                  label="Адрес зоны доставки"
                  error={errors.address}
                  onAddressSelect={(addressData) => {
                    if (addressData) {
                      setValue('postal_code', addressData.postal_code);
                      setValue('fias_id', addressData.fias_id);
                      setValue('geo_lat', addressData.geo_lat);
                      setValue('geo_lon', addressData.geo_lon);
                    }
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="geo_lat"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled
                    label="Широта"
                    fullWidth
                    InputLabelProps={{ shrink: !!field.value }}
                    error={!!errors.geo_lat}
                    helperText={errors.geo_lat?.message}
                  />
                )}
              />
              
              <Controller
                name="geo_lon"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled
                    label="Долгота"
                    fullWidth
                    InputLabelProps={{ shrink: !!field.value }}
                    error={!!errors.geo_lon}
                    helperText={errors.geo_lon?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Почтовый индекс"
                    fullWidth
                    disabled
                    InputLabelProps={{ shrink: !!field.value }}
                    error={!!errors.postal_code}
                    helperText={errors.postal_code?.message}
                  />
                )}
              />
              
              <Controller
                name="fias_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ФИАС ID"
                    disabled
                    fullWidth
                    InputLabelProps={{ shrink: !!field.value }}
                    error={!!errors.fias_id}
                    helperText={errors.fias_id?.message}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Временные интервалы */}
            <Typography variant="subtitle1">
              График доставки по дням недели
            </Typography>

            {dayOptions.map(day => (
              <Box key={day.value} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {day.label}
                </Typography>
                
                {(groupedTimes[day.value] || []).map((time, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <Typography>
                      {time.startTime.label} — {time.endTime.label}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        const fieldIndex = fields.findIndex(
                          f => f.dayOfWeek.value === day.value && 
                          f.startTime.value === time.startTime.value && 
                          f.endTime.value === time.endTime.value
                        );
                        if (fieldIndex !== -1) remove(fieldIndex);
                      }}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                
                <TimeRangePicker day={day.value} />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} startIcon={<CancelIcon />}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};