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
import { PickupPointFormData, TimeOption, PickupPoint } from '../../types/types';

const timeOptions: TimeOption[] = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00`,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

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
    startTime: timeOptions[9], // 09:00 по умолчанию
    endTime: timeOptions[12]  // 12:00 по умолчанию
  });

  const handleAddNewTime = () => {
    append({
      startTime: newTime.startTime,
      endTime: newTime.endTime
    });
    setIsAddingNew(false);
    setNewTime({
      startTime: timeOptions[9],
      endTime: timeOptions[12]
    });
  };

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
            Временные интервалы доставки
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}>
                <Typography>
                  {field.startTime.label} - {field.endTime.label}
                </Typography>
                <IconButton
                  onClick={() => remove(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          {isAddingNew ? (
            <>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddNewTime}
                        fullWidth
                    >
                        Добавить
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
              Добавить интервал
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