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

  const { control, handleSubmit, reset } = useForm<PickupPointFormData>();

  useEffect(() => {
    const fetchPickupPoints = async () => {
      setIsLoading(true);
      try {
        const response = await API.get('/pickup-points');
        // Преобразуем данные API в наш формат
        const formattedData = response.data.map((point: any) => ({
          ...point,
          deliveryTimes: point.deliveryTimes.map((time: any) => ({
            id: time.id,
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
        : [{ startTime: defaultTimeOptionStart, endTime: defaultTimeOptionEnd }];

      reset({
        id: editingPoint.id,
        name: editingPoint.name,
        deliveryTimes: initialDeliveryTimes
      });
    } else {
      reset({
        name: '',
        deliveryTimes: [{ startTime: defaultTimeOptionStart, endTime: defaultTimeOptionEnd }]
      });
    }
  }, [editingPoint, reset]);

  const onSubmit: SubmitHandler<PickupPointFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Преобразуем данные перед отправкой
      const payload = {
        ...data,
        deliveryTimes: data.deliveryTimes.map(time => ({
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
                    {point.deliveryTimes.map((time, idx) => (
                      <Box key={idx} className={styles.deliveryTimeItem}>
                        <Typography variant="body2">
                          {time.startTime.label} - {time.endTime.label}
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