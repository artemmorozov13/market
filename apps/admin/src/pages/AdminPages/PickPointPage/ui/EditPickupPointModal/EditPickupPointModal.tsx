import { FC, useState } from 'react';
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
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { WeekdayEnum } from "@core/enums/weekday.enum";
import { AddressSearchField } from '@features/AddressSearchField/ui/AddressSearchField';
import { PickupPointFormData } from '../../types/pickupPointPageType';

// Конфигурация временных интервалов
const timeOptions = [
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '12:00', label: '12:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' }
];

// Опции дней недели на русском
const weekdayOptions = [
  { value: WeekdayEnum.MONDAY, label: 'Понедельник' },
  { value: WeekdayEnum.TUESDAY, label: 'Вторник' },
  { value: WeekdayEnum.WEDNESDAY, label: 'Среда' },
  { value: WeekdayEnum.THURSDAY, label: 'Четверг' },
  { value: WeekdayEnum.FRIDAY, label: 'Пятница' },
  { value: WeekdayEnum.SATURDAY, label: 'Суббота' },
  { value: WeekdayEnum.SUNDAY, label: 'Воскресенье' }
];

// Функция для перевода дней недели
const getRussianWeekdayName = (day: WeekdayEnum) => {
  const option = weekdayOptions.find(d => d.value === day);
  return option ? option.label : day;
};

interface EditPickupPointModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  control: Control<PickupPointFormData>;
  setValue: UseFormSetValue<PickupPointFormData>;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  selectedPoint: any | null;
}

export const EditPickupPointModal: FC<EditPickupPointModalProps> = ({
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
    name: 'workingHours',
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTime, setNewTime] = useState({
    dayOfWeek: weekdayOptions[0].value,
    openingTime: timeOptions[2].value, // 10:00 по умолчанию
    closingTime: timeOptions[5].value  // 13:00 по умолчанию
  });

  const handleAddNewTime = () => {
    if (!validateTimeInterval()) return;
    
    append({
      dayOfWeek: newTime.dayOfWeek,
      openingTime: newTime.openingTime,
      closingTime: newTime.closingTime
    });
    setIsAddingNew(false);
    resetNewTime();
  };

  const resetNewTime = () => {
    setNewTime({
      dayOfWeek: weekdayOptions[0].value,
      openingTime: timeOptions[2].value,
      closingTime: timeOptions[5].value
    });
  };

  const groupByDay = () => {
    const grouped: Record<string, typeof fields[number][]> = {};
    
    fields.forEach(field => {
      const day = field.dayOfWeek;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(field);
    });
    
    return grouped;
  };

  const validateTimeInterval = () => {
    return (
      newTime.dayOfWeek && 
      newTime.openingTime && 
      newTime.closingTime &&
      newTime.openingTime < newTime.closingTime
    );
  };

  const groupedTimes = groupByDay();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        {isEditing ? `Редактировать ПВЗ: ${selectedPoint?.name}` : 'Добавить новый пункт выдачи'}
      </DialogTitle>
      
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Основная информация */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Основная информация</Typography>
              
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Обязательное поле' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название пункта выдачи *"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="fullAddress"
                control={control}
                rules={{ required: 'Обязательное поле' }}
                render={({ field: { value } }) => (
                  <AddressSearchField
                    control={control}
                    value={value}
                    name="fullAddress"
                    label="Адрес пункта выдачи *"
                    error={errors.fullAddress}
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

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Controller
                  name="geo_lat"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled
                      label="Широта"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.geo_lon}
                      helperText={errors.geo_lon?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Controller
                  name="postal_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Почтовый индекс"
                      fullWidth
                      disabled
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fias_id}
                      helperText={errors.fias_id?.message}
                    />
                  )}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* График работы */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                График работы *
              </Typography>

              {fields.length === 0 && !isAddingNew && (
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Нет добавленных интервалов работы
                </Typography>
              )}

              {Object.entries(groupedTimes).map(([day, times]) => (
                <Box key={day} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {getRussianWeekdayName(day as WeekdayEnum)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {times.map((time, index) => {
                      const fieldIndex = fields.findIndex(
                        f => f.dayOfWeek === day && 
                        f.openingTime === time.openingTime && 
                        f.closingTime === time.closingTime
                      );
                      
                      return (
                        <Box 
                          key={`${day}-${time.openingTime}-${time.closingTime}`}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 1.5,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Typography>
                            {time.openingTime} - {time.closingTime}
                          </Typography>
                          <IconButton
                            onClick={() => remove(fieldIndex)}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )})}
                  </Box>
                </Box>
              ))}

              {isAddingNew ? (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                    <FormControl fullWidth error={!newTime.dayOfWeek}>
                      <InputLabel>День недели *</InputLabel>
                      <Select
                        value={newTime.dayOfWeek}
                        label="День недели *"
                        onChange={(e) => {
                          setNewTime(prev => ({ 
                            ...prev, 
                            dayOfWeek: e.target.value as WeekdayEnum 
                          }));
                        }}
                      >
                        {weekdayOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl fullWidth error={!newTime.openingTime}>
                        <InputLabel>Время открытия *</InputLabel>
                        <Select
                          value={newTime.openingTime}
                          label="Время открытия *"
                          onChange={(e) => {
                            setNewTime(prev => ({ 
                              ...prev, 
                              openingTime: e.target.value 
                            }));
                          }}
                        >
                          {timeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth error={!newTime.closingTime || newTime.closingTime <= newTime.openingTime}>
                        <InputLabel>Время закрытия *</InputLabel>
                        <Select
                          value={newTime.closingTime}
                          label="Время закрытия *"
                          onChange={(e) => {
                            setNewTime(prev => ({ 
                              ...prev, 
                              closingTime: e.target.value 
                            }));
                          }}
                          error={newTime.closingTime <= newTime.openingTime}
                        >
                          {timeOptions
                            .filter(option => option.value > newTime.openingTime)
                            .map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                        </Select>
                        {newTime.closingTime <= newTime.openingTime && (
                          <Typography variant="caption" color="error">
                            Время закрытия должно быть позже времени открытия
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddNewTime}
                      fullWidth
                      disabled={!validateTimeInterval()}
                      sx={{ py: 1.5 }}
                    >
                      Добавить интервал
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsAddingNew(false);
                        resetNewTime();
                      }}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Отмена
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddingNew(true)}
                  sx={{ mt: 2 }}
                  fullWidth
                  size="large"
                >
                  Добавить интервал работы
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose} 
            startIcon={<CancelIcon />}
            sx={{ mr: 2 }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isSubmitting || fields.length === 0}
            sx={{ px: 4 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};