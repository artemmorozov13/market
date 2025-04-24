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
// import PlaceIcon from "@mui/icons-material/Place";
import { API } from "@/shared/api/API";
import clsx from "clsx"
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";
import { AddressType } from "@/entities/Addresses";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

function getAvailableDeliveryDates(
  deliveryDays: number[], // напр., [1, 4, 5]
  currentDate: Date = new Date()
): Date[] {
  const result: Date[] = [];
  const now = new Date(currentDate);
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // воскресенье = 7
  const currentTime = now.getTime();

  for (let i = 1; i <= 7; i++) {
    // Начинаем с понедельника (1) по воскресенье (7)
    if (i <= currentDay) continue; // только дни после сегодняшнего
    if (i === 1) continue; // исключаем понедельник (доставка в понедельник невозможна)

    if (deliveryDays.includes(i)) {
      const targetDate = new Date(now);
      const daysToAdd = i - currentDay;
      targetDate.setDate(now.getDate() + daysToAdd);
      targetDate.setHours(0, 0, 0, 0);

      // Проверка на 24 часа
      if (targetDate.getTime() - currentTime >= 24 * 60 * 60 * 1000) {
        result.push(targetDate);
      }
    }
  }

  return result;
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

export const getWeekDates = (deliveryTimes: DeliveryTime[], currentDate: Date = new Date()): Record<string, { date: string; isToday: boolean; formattedDate: string }> => {
  const now = new Date(currentDate);
  const currentDay = now.getDay(); // 0 (воскресенье) до 6 (суббота)
  const dates: Record<string, { date: string; isToday: boolean; formattedDate: string }> = {};

  // Получаем уникальные дни недели, для которых есть доставка
  const availableDays = Array.from(new Set(deliveryTimes.map(time => time.dayOfWeek)));

  availableDays.forEach(dayKey => {
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayKey);
    
    // Вычисляем разницу дней между текущим днем и днем доставки
    let dayDiff = dayIndex - currentDay;
    
    // Если день доставки уже прошел на этой неделе или это сегодня (доставка день в день не работает)
    if (dayDiff <= 0) return;
    
    const date = new Date(now);
    date.setDate(now.getDate() + dayDiff);
    
    dates[dayKey] = {
      date: date.toISOString().split('T')[0],
      isToday: false, // У нас никогда не будет isToday=true, так как dayDiff <= 0 отсекается
      formattedDate: formatDate(date.toISOString())
    };
  });

  return dates;
};

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<DeliveryTime[]>([]);
  const [weekDates, setWeekDates] = useState<Record<string, { date: string; isToday: boolean; formattedDate: string }>>({});
  const [isOpenAddAdressModal, setIsOpenAddAdressModal] = useState<boolean>(false);

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

  const { user } = useUser();
  const { addresses, options } = useUserAddresses(user?.user.id);
  const selectedPickupPointId = watch("pickupPointId");

  // Все временные слоты в weekDates уже доступны
  const availableDeliveryTimes = deliveryTimes.filter(time => 
    weekDates[time.dayOfWeek] !== undefined
  );
  
  // Группируем временные слоты по дням недели
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
    });
  };

  const handleOpenAddAdressModal = () => {
    setIsOpenAddAdressModal(true);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const settingPickPoint = (address: AddressType) => {
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
        
        setValue("pickupPointId", nearestPoint.id);
        setValue("deliveryTimeId", null);
      } else {
        setValue("pickupPointId", null);
        setValue("deliveryTimeId", null);
      }
    }
  }

  const handleSelectAddress = (field: ControllerRenderProps<OrderFormInputs, "address">) => (event: any) => {
    const address = addresses?.find(item => item.id === event?.target?.value);
    
    if (address) {
      field.onChange(address);
      settingPickPoint(address)
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
    fetchPickupPoints();
  }, []);

  useEffect(() => {
    if (selectedPickupPointId) {
      const selectedPoint = pickupPoints.find(p => p.id === selectedPickupPointId);
      if (selectedPoint) {
        const deliveryTimes = selectedPoint.deliveryTimes;
        setDeliveryTimes(deliveryTimes);
  
        const deliveryDays = deliveryTimes.map(time => {
          const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(time.dayOfWeek);
          return dayIndex === 0 ? 7 : dayIndex; // Приводим к 1-7
        });
  
        const availableDates = getAvailableDeliveryDates(deliveryDays);
        
        const formattedDates = availableDates.reduce((acc, date) => {
          const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
          acc[dayKey] = {
            date: date.toISOString().split("T")[0],
            isToday: false,
            formattedDate: formatDate(date.toISOString())
          };
          return acc;
        }, {} as Record<string, { date: string; isToday: boolean; formattedDate: string }>);
  
        setWeekDates(formattedDates);
        setValue("deliveryTimeId", null);
      }
    } else {
      setDeliveryTimes([]);
      setWeekDates({});
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
        key={isOpenAddAdressModal ? 'open' : 'closed'}
        isOpen={isOpenAddAdressModal}
        onClose={() => setIsOpenAddAdressModal(false)}
        setAddressValue={setValue}
        settingPickPoint={settingPickPoint}
      />
      <Box className={styles.modalContainer}>
        <Typography variant="h6" className={styles.modalTitle} gutterBottom>
          Данные для доставки
        </Typography>
        <form onSubmit={handleSubmit(confirmForm)}>
          {!!options?.length ? (
            <div className={styles.addressInput}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="address-label">
                  Выберите адрес доставки
                </InputLabel>
                <Controller
                  name="address"
                  control={control}
                  defaultValue={options[0].value}
                  render={({ field }) => (
                    <Select
                      value={field.value?.id}
                      onChange={handleSelectAddress(field)}
                      labelId="address-label"
                      label={!options?.length ? 'Нет доступных адресов' : 'Выберите адрес доставки'}
                      error={!!errors.address}
                      MenuProps={{
                        classes: {
                          paper: clsx(styles.menuPaper, styles.paperRoot),
                          list: styles.addressesList
                        }
                      }}
                    >
                      {options?.map((option) => (
                        <MenuItem key={option.value} value={option.value} className={styles.menuItem}>
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
            </div>
          ) : null}
          <Button
            onClick={handleOpenAddAdressModal}
            className={styles.addAdressBtn}
            variant="outlined"
            color="info"
            fullWidth
          >
            Добавить новый адрес
          </Button>

          {/* <Box mb={2}>
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
            </FormControl>
          </Box> */}

          {selectedPickupPointId && deliveryTimes.length > 0 && (
            Object.keys(weekDates).length > 0 ? (
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
            ) : (
              <Box mb={2} textAlign="center" py={2}>
                <Typography variant="body1" color="textSecondary">
                  Доставка на этой неделе по вашему адресу закончилась
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Пожалуйста, выберите другой пункт выдачи или попробуйте позже
                </Typography>
              </Box>
            )
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
  );
});