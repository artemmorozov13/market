import { FC, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { 
  TextField, 
  Typography, 
  Box, 
  InputAdornment, 
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Button
} from "@mui/material";
import styles from "./OrderForm.module.scss";
import { DeliveryTime, OrderFormInputs, PickupPoint } from "../types/orderFormTypes";
import { orderFormSchema } from "../lib/orderFormSchema";
import { observer } from "mobx-react-lite";
import { formatToRussianPhone } from "@/shared/helpers/formatRussianPhone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import CommentIcon from "@mui/icons-material/Comment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlaceIcon from "@mui/icons-material/Place";
import { API } from "@/shared/api/API";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<DeliveryTime[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<OrderFormInputs>({
    resolver: yupResolver(orderFormSchema) as any,
    defaultValues: {
      address: "",
      phone: "",
      comment: "",
      pickupPointId: null,
      deliveryTimeId: null
    },
  });

  const selectedPickupPointId = watch("pickupPointId");

  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const response = await API.get<PickupPoint[]>('/pickup-points');
        setPickupPoints(response.data);
      } catch (error) {
        console.error('Error fetching pickup points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPickupPoints();
  }, []);

  useEffect(() => {
    if (selectedPickupPointId) {
      const selectedPoint = pickupPoints.find(p => p.id === selectedPickupPointId);
      if (selectedPoint) {
        setDeliveryTimes(selectedPoint.deliveryTimes);
        setValue("deliveryTimeId", null);
      }
    } else {
      setDeliveryTimes([]);
    }
  }, [selectedPickupPointId, pickupPoints, setValue]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={styles.modalContainer}>
      <Typography variant="h6" className={styles.modalTitle} gutterBottom>
        Данные для доставки
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={2}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="pickup-point-label">Пункт выдачи</InputLabel>
            <Controller
              name="pickupPointId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="pickup-point-label"
                  label="Пункт выдачи"
                  error={!!errors.pickupPointId}
                  startAdornment={
                    <InputAdornment position="start">
                      <PlaceIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {pickupPoints.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.pickupPointId && (
              <Typography color="error" variant="body2">
                {errors.pickupPointId.message}
              </Typography>
            )}
          </FormControl>
        </Box>

        {selectedPickupPointId && (
          <Box mb={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="delivery-time-label">Время доставки</InputLabel>
              <Controller
                name="deliveryTimeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="delivery-time-label"
                    label="Время доставки"
                    error={!!errors.deliveryTimeId}
                    startAdornment={
                      <InputAdornment position="start">
                        <ScheduleIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    {deliveryTimes.map((time) => (
                      <MenuItem key={time.id} value={time.id}>
                        {time.startTime} - {time.endTime}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.deliveryTimeId && (
                <Typography color="error" variant="body2">
                  {errors.deliveryTimeId.message}
                </Typography>
              )}
            </FormControl>
          </Box>
        )}

        <Box mb={1}>
          <Controller
            name="address"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value}
                onChange={onChange}
                label="Адрес доставки"
                fullWidth
                variant="outlined"
                margin="normal"
                error={!!errors.address}
                helperText={errors.address?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  ),
                  placeholder: "Введите полный адрес доставки",
                }}
              />
            )}
          />
        </Box>

        <Box mb={1}>
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                value={formatToRussianPhone(value)}
                onChange={(e) => onChange(formatToRussianPhone(e.target.value))}
                label="Номер телефона"
                fullWidth
                variant="outlined"
                margin="normal"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box mb={1}>
          <Controller
            name="comment"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value}
                onChange={onChange}
                label="Комментарий к заказу (необязательно)"
                fullWidth
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CommentIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>
        <Button type="submit" variant="contained" fullWidth>
          Заказать
        </Button>
      </form>
    </Box>
  );
});