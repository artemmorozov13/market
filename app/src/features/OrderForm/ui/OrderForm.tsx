import { FC, useEffect, useState } from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
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
  Button,
  ListSubheader
} from "@mui/material";
import styles from "./OrderForm.module.scss";
import { DeliveryTime, OrderFormInputs, PickupPoint } from "../types/orderFormTypes";
import { orderFormSchema } from "../lib/orderFormSchema";
import { observer } from "mobx-react-lite";
import { formatToRussianPhone } from "@/shared/helpers/formatRussianPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import CommentIcon from "@mui/icons-material/Comment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlaceIcon from "@mui/icons-material/Place";
import { API } from "@/shared/api/API";
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  const weekday = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'][date.getDay()];
  return `${weekday}, ${day}.${month}`;
};

export const getWeekDates = (): Record<string, { date: string; isToday: boolean; formattedDate: string }> => {
  const now = new Date();
  const dates: Record<string, { date: string; isToday: boolean; formattedDate: string }> = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dayOfWeek = date.getDay();
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    
    dates[dayKey] = {
      date: date.toISOString().split('T')[0],
      isToday: i === 0,
      formattedDate: formatDate(date.toISOString())
    };
  }

  return dates;
};

export const isTimeSlotAvailable = (
  timeSlot: DeliveryTime,
  weekDates: Record<string, { date: string; isToday: boolean; formattedDate: string }>,
): boolean => {
  const todayData = weekDates[timeSlot.dayOfWeek];
  if (!todayData?.isToday) return true;

  const now = new Date();
  const [hours, minutes] = timeSlot.startTime.split(':').map(Number);
  const slotTime = new Date(now);
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime > now;
};

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<DeliveryTime[]>([]);
  const [weekDates, setWeekDates] = useState<Record<string, { date: string; isToday: boolean; formattedDate: string }>>({});
  const [isOpenAddAdressModal, setIsOpenAddAdressModal] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<OrderFormInputs>({
    resolver: yupResolver(orderFormSchema) as any,
    defaultValues: {
      address: null,
      phone: "",
      comment: "",
      pickupPointId: null,
      deliveryTimeId: null,
      deliveryDate: null
    },
  });

  const { user } = useUser()
  const { addresses, options } = useUserAddresses(user?.user.id)

  const selectedPickupPointId = watch("pickupPointId");

  const availableDeliveryTimes = deliveryTimes.filter(time => 
    isTimeSlotAvailable(time, weekDates)
  );
  
  const groupedDeliveryTimes = availableDeliveryTimes.reduce((acc, time) => {
    const day = time.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(time);
    return acc;
  }, {} as Record<string, DeliveryTime[]>);

  const confirmForm = (data: OrderFormInputs) => {
    onSubmit({
      ...data,
      deliveryDate: data.deliveryDate,
    })
  };

  const handleOpenAddAdressModal = () => {
    setIsOpenAddAdressModal(true)
  }

  // Функция для расчета расстояния между двумя точками по координатам (формула гаверсинусов)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSelectAddress = (field: ControllerRenderProps<OrderFormInputs, "address">) => (event: any) => {
    // Вызываем оригинальное изменение поля адреса
    
    const address = addresses?.find(item => item.id === event?.target?.value);

    field.onChange(address);

    if (address && pickupPoints) {
      const pointsWithCoords = pickupPoints.filter(
        point => point.geo_lat && point.geo_lon
      );
      
      if (pointsWithCoords.length > 0) {
        const addressLat = parseFloat(address.geo_lat);
        const addressLon = parseFloat(address.geo_lon);
        
        const pointsWithDistance = pointsWithCoords.map(point => ({
          ...point,
          distance: calculateDistance(
            addressLat,
            addressLon,
            parseFloat(point.geo_lat),
            parseFloat(point.geo_lon)
          )
        }));
        
        const nearestPoint = pointsWithDistance.sort((a, b) => a.distance - b.distance)[0];
        
        console.log('Ближайший пункт выдачи:', nearestPoint);
        console.log('Расстояние:', nearestPoint.distance, 'км');
        
        // Устанавливаем значение ближайшего пункта выдачи в форму
        setValue("pickupPointId", nearestPoint.id);
        
        // Также можно сбросить выбранное время доставки
        setValue("deliveryTimeId", null);
      } else {
        console.log('Нет пунктов выдачи с координатами');
        // Если нет пунктов с координатами, сбрасываем выбор
        setValue("pickupPointId", null);
        setValue("deliveryTimeId", null);
      }
    }
  };

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
    setWeekDates(getWeekDates());
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
    <>
      <AddNewAddressModal
        isOpen={isOpenAddAdressModal}
        onClose={() => setIsOpenAddAdressModal(false)}
      />
      <Box className={styles.modalContainer}>
        <Typography variant="h6" className={styles.modalTitle} gutterBottom>
          Данные для доставки
        </Typography>
        <form onSubmit={handleSubmit(confirmForm)}>
          <Box mb={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="address-label">Адрес доставки</InputLabel>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.id}
                    onChange={handleSelectAddress(field)}
                    labelId="address-label"
                    label="Адрес доставки"
                    error={!!errors.address}
                  >
                    {options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.address && (
                <Typography color="error" variant="body2">
                  {errors.address.message}
                </Typography>
              )}
            </FormControl>
          </Box>
          <Button onClick={handleOpenAddAdressModal} className={styles.addAdressBtn} variant="outlined" color="info" fullWidth>Добавить новый адрес</Button>

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
                    disabled
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

          {selectedPickupPointId && deliveryTimes.length > 0 && (
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
                      renderValue={(selected) => {
                        const selectedTime = deliveryTimes.find(time => time.id === selected);
                        if (!selectedTime) return null;
                        const date = weekDates[selectedTime.dayOfWeek]?.formattedDate;
                        return `${date}, ${selectedTime.startTime} - ${selectedTime.endTime}`;
                      }}
                    >
                      {Object.entries(groupedDeliveryTimes).map(([day, times]) => [
                        <ListSubheader key={`header-${day}`}>
                          {weekDates[day]?.formattedDate}
                        </ListSubheader>,
                        ...times.map((time) => (
                          <MenuItem 
                            key={time.id} 
                            value={time.id}
                            onClick={() => {
                              setValue("deliveryDate", weekDates[day].date);
                            }}
                          >
                            {time.startTime} - {time.endTime}
                          </MenuItem>
                        ))
                      ])}
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
    </>
    
  )
})