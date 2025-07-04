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
import styles from './DeliveryAreasPage.module.scss';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { dayOptions } from '../../consts/intervals';
import { DeliveryArea, TimeOption, useCreateDeliveryArea, useDeleteDeliveryArea, useDeliveryAreas, useUpdateDeliveryArea } from '@entities/DeliveryArea';
import { DeliveryAreaFormData } from '../../types/types';
import { EditDeliveryAreaModal } from '../EditPickupPointModal/EditPickupPointModal';

const defaultTimeOptionStart: TimeOption = {
  value: '09:00',
  label: '09:00'
};

const defaultTimeOptionEnd: TimeOption = {
  value: '12:00',
  label: '12:00'
};

const DeliveryAreasPage: FC = () => {
  const { deliveryAreas, isLoading, error } = useDeliveryAreas();
  const createMutation = useCreateDeliveryArea();
  const updateMutation = useUpdateDeliveryArea();
  const deleteMutation = useDeleteDeliveryArea();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<DeliveryArea | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<DeliveryAreaFormData>();

  useEffect(() => {
    if (editingPoint) {
      const initialDeliveryTimes = editingPoint.deliveryTimes.length > 0
        ? [...editingPoint.deliveryTimes]
        : [{
            dayOfWeek: dayOptions[0],
            startTime: defaultTimeOptionStart,
            endTime: defaultTimeOptionEnd
          }];
  
      reset({
        id: editingPoint.id,
        name: editingPoint.name,
        radius: editingPoint.radius,
        address: editingPoint.fullAddress,
        fias_id: editingPoint.fias_id,
        postal_code: editingPoint.postal_code,
        geo_lat: editingPoint.geo_lat,
        geo_lon: editingPoint.geo_lon,
        deliveryTimes: initialDeliveryTimes
      });
    } else {
      reset({
        name: '',
        radius: 5000,
        address: '',
        fias_id: '',
        postal_code: '',
        geo_lat: '',
        geo_lon: '',
        deliveryTimes: [{
          dayOfWeek: dayOptions[0],
          startTime: defaultTimeOptionStart,
          endTime: defaultTimeOptionEnd
        }]
      });
    }
  }, [editingPoint, reset]);

  const onSubmit: SubmitHandler<DeliveryAreaFormData> = async (data) => {
    if (data.id) {
      await updateMutation.mutateAsync({
        id: data.id,
        ...data
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsDialogOpen(false);
    setEditingPoint(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  if (error) {
    return (
      <ShopOwnerLayout>
        Ошибка при загрузке зон доставки
      </ShopOwnerLayout>
    )
  }

  return (
    <ShopOwnerLayout>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h4">Зоны доставки</Typography>
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
            Добавить зону доставки
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {deliveryAreas?.map((point) => (
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
                  <Box>
                    <Typography variant="subtitle2">Время доставки:</Typography>
                    {Object.entries(
                      point.deliveryTimes.reduce((acc, time) => {
                        const day = time.dayOfWeek.label;
                        if (!acc[day]) acc[day] = [];
                        acc[day].push(time);
                        return acc;
                      }, {} as Record<string, typeof point.deliveryTimes>)
                    ).map(([day, times]) => (
                      <Box key={day} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">{day}:</Typography>
                        {times.map((time, idx) => (
                          <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                            {time.startTime.label} - {time.endTime.label}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <EditDeliveryAreaModal
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

export default DeliveryAreasPage;