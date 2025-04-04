// EditPickupPointModal.tsx
import { FC, useState } from 'react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
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
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { PickupPointFormData, TimeOption, DayOption, PickupPoint, DeliveryTimeForm } from '../../types/types';
import { dayOptions, timeOptions } from '../../consts/intervals';

interface EditPickupPointModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  control: Control<PickupPointFormData>;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  selectedPoint: PickupPoint | null;
}

export const EditPickupPointModal: FC<EditPickupPointModalProps> = ({
  open,
  onClose,
  onSubmit,
  control,
  errors,
  isSubmitting,
  isEditing,
  selectedPoint
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliveryTimes',
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTime, setNewTime] = useState({
    dayOfWeek: dayOptions[0],
    startTime: timeOptions[9],
    endTime: timeOptions[12]
  });

  const handleAddNewTime = () => {
    append({
      dayOfWeek: newTime.dayOfWeek,
      startTime: newTime.startTime,
      endTime: newTime.endTime
    });
    setIsAddingNew(false);
    setNewTime({
      dayOfWeek: dayOptions[0],
      startTime: timeOptions[9],
      endTime: timeOptions[12]
    });
  };

  const groupByDay = () => {
    const grouped: Record<string, DeliveryTimeForm[]> = {};
    
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Редактировать ПВЗ' : 'Добавить новый ПВЗ'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Название обязательно' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Название пункта выдачи"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Временные интервалы доставки по дням недели
          </Typography>

          {Object.entries(groupedTimes).map(([day, times]) => (
            <Box key={day} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {dayOptions.find(d => d.value === day)?.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {times.map((time, index) => (
                  <Box 
                    key={`${time.dayOfWeek}${time.startTime}`} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1
                    }}
                  >
                    <Typography>
                      {time.startTime.label} - {time.endTime.label}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        const fieldIndex = fields.findIndex(
                          f => f.dayOfWeek.value === day && 
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
              </Box>
            </Box>
          ))}

          {isAddingNew ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>День недели</InputLabel>
                  <Select
                    value={newTime.dayOfWeek.value}
                    label="День недели"
                    onChange={(e) => {
                      const selectedOption = dayOptions.find(opt => opt.value === e.target.value);
                      if (selectedOption) {
                        setNewTime(prev => ({ ...prev, dayOfWeek: selectedOption }));
                      }
                    }}
                  >
                    {dayOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Время начала</InputLabel>
                    <Select
                      value={newTime.startTime.value}
                      label="Время начала"
                      onChange={(e) => {
                        const selectedOption = timeOptions.find(opt => opt.value === e.target.value);
                        if (selectedOption) {
                          setNewTime(prev => ({ ...prev, startTime: selectedOption }));
                        }
                      }}
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Время окончания</InputLabel>
                    <Select
                      value={newTime.endTime.value}
                      label="Время окончания"
                      onChange={(e) => {
                        const selectedOption = timeOptions.find(opt => opt.value === e.target.value);
                        if (selectedOption) {
                          setNewTime(prev => ({ ...prev, endTime: selectedOption }));
                        }
                      }}
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNewTime}
                fullWidth
                sx={{ mb: 2 }}
              >
                Добавить интервал
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsAddingNew(false)}
                fullWidth
              >
                Отмена
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsAddingNew(true)}
              sx={{ mt: 1 }}
              fullWidth
            >
              Добавить интервал для дня
            </Button>
          )}
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
