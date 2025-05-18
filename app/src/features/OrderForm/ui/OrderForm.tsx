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
import { LoginButton } from '@telegram-auth/react';
import { API } from "@/shared/api/API";
import clsx from "clsx"
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";
import { AddressType } from "@/entities/Addresses";
import { basketStore } from "@/entities/Basket";
import { calculateDistance } from "@/shared/helpers/calculateDistance";
import { getAvailableDeliveryDates } from "@/shared/helpers/getAvailableDeliveryDates";
import { formatToRussianDate } from "@/shared/helpers/formatToRussianDate";
import { DEFAULT_STATIC_PICKUP_POINT_NAME } from "@/shared/consts/applicationConsts";
import { userStore } from "@/entities/User";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<DeliveryTime[]>([]);
  const [weekDates, setWeekDates] = useState<Record<string, { date: Date; isToday: boolean; formattedDate: string }>>({});
  const [isOpenAddAdressModal, setIsOpenAddAdressModal] = useState<boolean>(false);
  const [initData, setInitData] = useState<string>("")

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

  const { user } = useUser({ initData });
  const { role } = userStore
  const { addresses, options } = useUserAddresses(user?.user.id);
  const selectedPickupPointId = watch("pickupPointId");

  const availableDeliveryTimes = deliveryTimes.filter(time => 
    weekDates[time.dayOfWeek] !== undefined
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
    });
  };

  const handleOpenAddAdressModal = () => {
    setIsOpenAddAdressModal(true);
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
        
        const availablePoint = pointsWithDistance.filter(
          (pickupPoint) => pickupPoint.distance < pickupPoint.radius / 1000
        );
        const nearestPoint = availablePoint.sort((a, b) => a.distance - b.distance)[0];

        if (nearestPoint) {
          setValue("pickupPointId", nearestPoint.id);
          setValue("deliveryTimeId", null);
        } else {
          const defaultPickUpPoint = pointsWithDistance.find(point => point.name === DEFAULT_STATIC_PICKUP_POINT_NAME)
          
          if (defaultPickUpPoint?.id) {
            setValue("pickupPointId", defaultPickUpPoint.id);
            setValue("deliveryTimeId", defaultPickUpPoint.deliveryTimes[0].id);
          } else {
            setValue("pickupPointId", null);
            setValue("deliveryTimeId", null);
          }
        }
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

  const handleTelegramAuth = (data: any) => {
    setInitData(JSON.stringify(data))
  }

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
            date: date,
            isToday: false,
            formattedDate: formatToRussianDate(date.toString())
          };
          return acc;
        }, {} as Record<string, { date: Date; isToday: boolean; formattedDate: string }>);
  
        setWeekDates(formattedDates);
        setValue("deliveryTimeId", null);
      }
    } else {
      setDeliveryTimes([]);
      setWeekDates({});
    }
  }, [selectedPickupPointId, pickupPoints, setValue]);

  const isExpiredProduct = !!basketStore.basketList.find(basketItem => basketItem.product.is_expired)

  if (role === "notAuthed") {
    return (
      <Box>
        <Typography variant="h5" className={styles.title}>
          Требуется авторизация
        </Typography>
        <Typography variant="body1" className={styles.description}>
          Для создания заказа требуется авторизация
        </Typography>
        <LoginButton
            botUsername={'fricti_test_bot'}
            authCallbackUrl={'https://fruvost.ru/app'}
            buttonSize="large"
            cornerRadius={5}
            showAvatar={true}
            lang="ru"
            onAuthCallback={handleTelegramAuth}
            requestAccess={'write'}
        />
      </Box>
    )
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedPickupPoint = pickupPoints.find(pickupPoint => pickupPoint.id === selectedPickupPointId)

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
        <form onSubmit={handleSubmit(confirmForm, (err) => console.log(err))}>
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

          {selectedPickupPoint?.name === DEFAULT_STATIC_PICKUP_POINT_NAME ? (
            <Box mb={2} textAlign="center" py={2}>
              <Typography variant="body1" color="textSecondary">
                К сожалению, доставка по Вашему адресу пока недоступна
              </Typography>
            </Box>
          ) : selectedPickupPointId && deliveryTimes.length > 0 ? (
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
              </Box>
            )
          ) : null}

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
          <Button
            type="submit"
            variant="contained"
            disabled={isExpiredProduct}
            fullWidth
          >
            Заказать
          </Button>
        </form>
      </Box>
    </>
  );
});