import { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import styles from './PickPointPage.module.scss';
import { EditPickupPointModal } from '../EditPickupPointModal/EditPickupPointModal';
import { PickupPoint, PickupPointFormData } from '../../types/pickupPointPageType';
import { WeekdayEnum } from '@core/enums/weekday.enum';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { useCreatePickupPoint, useDeletePickupPoint, usePickupPoints, useUpdatePickupPoint } from '@entities/PickupPoint';

const PickPointPage: FC = () => {
  const { pickupPoints, isLoading, error } = usePickupPoints();
  const createMutation = useCreatePickupPoint();
  const updateMutation = useUpdatePickupPoint();
  const deleteMutation = useDeletePickupPoint();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<PickupPointFormData>();

  useEffect(() => {
    if (editingPoint) {
      reset({
        id: editingPoint.id,
        name: editingPoint.name,
        fullAddress: editingPoint.fullAddress,
        postal_code: editingPoint.postal_code || '',
        fias_id: editingPoint.fias_id || '',
        geo_lat: editingPoint.geo_lat || '',
        geo_lon: editingPoint.geo_lon || '',
        workingHours: editingPoint.workingHours || []
      });
    } else {
      reset({
        name: '',
        fullAddress: '',
        postal_code: '',
        fias_id: '',
        geo_lat: '',
        geo_lon: '',
        workingHours: []
      });
    }
  }, [editingPoint, reset]);

  const getRussianWeekdayName = (day: WeekdayEnum) => {
    const weekdayTranslations: Record<WeekdayEnum, string> = {
      [WeekdayEnum.MONDAY]: 'Понедельник',
      [WeekdayEnum.TUESDAY]: 'Вторник',
      [WeekdayEnum.WEDNESDAY]: 'Среда',
      [WeekdayEnum.THURSDAY]: 'Четверг',
      [WeekdayEnum.FRIDAY]: 'Пятница',
      [WeekdayEnum.SATURDAY]: 'Суббота',
      [WeekdayEnum.SUNDAY]: 'Воскресенье'
    };
  
    return weekdayTranslations[day] || day;
  };

  const getWeekdayName = (day: WeekdayEnum) => {
    return getRussianWeekdayName(day);
  };

  const onSubmit: SubmitHandler<PickupPointFormData> = async (data) => {
    try {
      if (data.id) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsDialogOpen(false);
      setEditingPoint(null);
    } catch (error) {
      console.error('Error saving pickup point:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting pickup point:', error);
    }
  };

  if (error) {
    return <div>Ошибка при загрузке пунктов выдачи</div>;
  }

  return (
    <ShopOwnerLayout>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h4">Пункты выдачи</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              reset();
              setEditingPoint(null);
              setIsDialogOpen(true);
            }}
          >
            Добавить пункт выдачи
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {pickupPoints?.map((point) => (
              <Grid item xs={12} sm={6} md={4} key={point.id}>
                <Paper elevation={3} className={styles.card}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">{point.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingPoint(point);
                          setIsDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirmId(point.id)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">{point.fullAddress}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography variant="subtitle2">График работы:</Typography>
                    {point.workingHours?.map((wh, idx) => (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {getWeekdayName(wh.dayOfWeek)}: {wh.openingTime} - {wh.closingTime}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <EditPickupPointModal
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingPoint(null);
          }}
          onSubmit={handleSubmit(onSubmit)}
          control={control}
          errors={{}}
          setValue={setValue}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          isEditing={!!editingPoint}
          selectedPoint={editingPoint}
        />

        <DeleteConfirmationModal
          open={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          isDeleting={deleteMutation.isPending}
        />
      </Box>
    </ShopOwnerLayout>
  );
};

export default PickPointPage;