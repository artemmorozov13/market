import { FC, useState, useEffect } from 'react';
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
import { API } from '@shared/api/instance';
import { PickupPoint, PickupPointFormData, TimeOption } from '../../types/types';
import { EditPickupPointModal } from '../EditPickupPointModal/EditPickupPointModal';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { dayOptions, timeOptions } from '../../consts/intervals';

const defaultTimeOptionStart: TimeOption = {
  value: '09:00',
  label: '09:00'
};

const defaultTimeOptionEnd: TimeOption = {
  value: '12:00',
  label: '12:00'
};

const PickPointPage: FC = () => {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<PickupPointFormData>();

  useEffect(() => {
    const fetchPickupPoints = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('/pickup-points');
        const formattedData = response.data.map((point: any) => ({
          ...point,
          deliveryTimes: point.deliveryTimes.map((time: any) => ({
            id: time.id,
            dayOfWeek: {
              value: time.dayOfWeek,
              label: dayOptions.find(d => d.value === time.dayOfWeek)?.label || time.dayOfWeek
            },
            startTime: {
              value: time.startTime,
              label: time.startTime
            },
            endTime: {
              value: time.endTime,
              label: time.endTime
            }
          }))
        }));
        setPoints(formattedData);
      } catch (error) {
        console.error('Error fetching pickup points:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPickupPoints();
  }, []);

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

  const onSubmit: SubmitHandler<PickupPointFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        address: {
          fullAddress: data.address,
          postal_code: data.postal_code,
          fias_id: data.fias_id,
          geo_lat: data.geo_lat,
          geo_lon: data.geo_lon,
        },
        deliveryTimes: data.deliveryTimes.map(time => ({
          dayOfWeek: time.dayOfWeek.value,
          startTime: time.startTime.value,
          endTime: time.endTime.value
        }))
      };
  
      if (data.id) {
        const response = await API.put(`/pickup-points/${data.id}`, payload);
        setPoints(points.map(point => point.id === data.id ? {
          ...response.data,
          deliveryTimes: response.data.deliveryTimes.map((time: any) => ({
            id: time.id,
            dayOfWeek: {
              value: time.dayOfWeek,
              label: dayOptions.find(d => d.value === time.dayOfWeek)?.label || time.dayOfWeek
            },
            startTime: {
              value: time.startTime,
              label: time.startTime
            },
            endTime: {
              value: time.endTime,
              label: time.endTime
            }
          }))
        } : point));
      } else {
        const response = await API.post('/pickup-points', payload);
        setPoints([...points, {
          ...response.data,
          deliveryTimes: response.data.deliveryTimes.map((time: any) => ({
            id: time.id,
            dayOfWeek: {
              value: time.dayOfWeek,
              label: dayOptions.find(d => d.value === time.dayOfWeek)?.label || time.dayOfWeek
            },
            startTime: {
              value: time.startTime,
              label: time.startTime
            },
            endTime: {
              value: time.endTime,
              label: time.endTime
            }
          }))
        }]);
      }
      setIsDialogOpen(false);
      setEditingPoint(null);
    } catch (error) {
      console.error('Error saving pickup point:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await API.delete(`/pickup-points/${id}`);
      setPoints(points.filter(point => point.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting pickup point:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
              reset()
              setEditingPoint(null);
              setIsDialogOpen(true);
            }}
          >
            Добавить ПВЗ
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {points?.map((point) => (
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
                        const day = dayOptions.find(d => d.value === time.dayOfWeek.value)?.label || time.dayOfWeek;
                        if (!acc[day as any]) acc[day as any] = [];
                        acc[day as any].push(time);
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
          isSubmitting={isSubmitting}
          isEditing={!!editingPoint}
          selectedPoint={editingPoint}
        />

        <DeleteConfirmationModal
          open={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          isDeleting={isDeleting}
        />
      </Box>
    </ShopOwnerLayout>
  );
};

export default PickPointPage;