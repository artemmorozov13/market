import { FC, useEffect, useState, useMemo } from "react";
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
  Button,
  ListSubheader,
  Paper,
  Chip
} from "@mui/material";
import styles from "./OrderForm.module.scss";
import { OrderFormInputs, PickupPoint } from "../types/orderFormTypes";
import { orderFormSchema } from "../lib/orderFormSchema";
import { observer } from "mobx-react-lite";
import { formatToRussianPhone } from "@/shared/helpers/formatRussianPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import CommentIcon from "@mui/icons-material/Comment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { API } from "@/shared/api/API";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";
import { AddressType } from "@/entities/Addresses";
import { basketStore } from "@/entities/Basket";
import { calculateDistance } from "@/shared/helpers/calculateDistance";
import { DEFAULT_STATIC_PICKUP_POINT_NAME } from "@/shared/consts/applicationConsts";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { userStore, useUpdateUser } from "@/entities/User";
import { useDeliveryTimes } from "@/entities/DeliveryTime";
import { formatToRussianDate } from "@/shared/helpers/formatToRussianDate";
import { ProductStatusEnum } from "@core/enums/product-status-enum";
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useSearchParams } from "react-router";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [searchParams] = useSearchParams();
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const { user } = useUser({ 
    onSuccess: () => {
      if (user?.user?.phone_number) {
        setValue('phone', user.user.phone_number);
      }
      if (user?.user?.selectedAddress) {
        setValue('addressId', user.user.selectedAddress.id);
      }
    }
  });

  const { selectedStore } = userStore
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<OrderFormInputs>({
    resolver: yupResolver(orderFormSchema) as any,
    defaultValues: {
      phone: user?.user.phone_number,
      comment: "",
      pickupPointId: null,
      deliveryTimeId: null,
      deliveryDate: null,
      addressId: null
    },
  });

  const selectedPickupPointId = watch("pickupPointId");
  const selectedAddressId = watch("addressId");
  const { deliveryTimeData } = useDeliveryTimes(selectedPickupPointId);
  const { updateUser } = useUpdateUser();
  const { addresses } = useUserAddresses();

  const selectedAddress = useMemo(() => {
    return addresses?.find(addr => addr.id === selectedAddressId) || user?.user?.selectedAddress;
  }, [addresses, selectedAddressId, user?.user?.selectedAddress]);

  const confirmForm = (data: OrderFormInputs) => {
    const storeId = searchParams.get('storeId');
    onSubmit({
      ...data,
      address: user?.user.selectedAddress,
      addressId: user?.user.selectedAddressId as any,
      deliveryDate: data.deliveryDate,
      storeId: selectedStore?.id || Number(storeId)
    });
    updateUser({ phone_number: data.phone });
  };

  const findNearestPickupPoint = (address: AddressType, points: PickupPoint[]) => {
    if (!address || !points?.length) return null;

    const pointsWithCoords = points.filter(point => point.geo_lat && point.geo_lon);
    if (!pointsWithCoords.length) return null;

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

    const availablePoints = pointsWithDistance.filter(
      point => point.distance < point.radius / 1000
    );

    const nearestPoint = [...availablePoints].sort((a, b) => a.distance - b.distance)[0];
    if (nearestPoint) return nearestPoint;

    return pointsWithDistance.find(
      point => point.name === DEFAULT_STATIC_PICKUP_POINT_NAME
    ) || null;
  };

  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const storeId = searchParams.get('storeId');
        const response = await API.post<PickupPoint[]>('/pickup-points', { storeId });
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
    if (selectedAddress && pickupPoints.length) {
      const nearestPoint = findNearestPickupPoint(selectedAddress, pickupPoints);
      if (nearestPoint) {
        setValue("pickupPointId", nearestPoint.id);
        setValue("deliveryTimeId", null);
      }
    }
  }, [selectedAddress, pickupPoints, setValue]);

  const isExpiredProduct = basketStore.basketList.some(
    item => item.product.status === ProductStatusEnum.Expired
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedPickupPoint = pickupPoints.find(p => p.id === selectedPickupPointId);

  return (
    <Paper className={styles.paper}>
      <Box className={styles.modalContainer}>
        <form onSubmit={handleSubmit(confirmForm)}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Адрес доставки
            </Typography>
            
            {selectedAddress ? (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocationOnIcon color="primary" />
                <Typography variant="body1">
                  {selectedAddress.fullAddress}
                  {selectedAddress.apartment && `, кв. ${selectedAddress.apartment}`}
                  {selectedAddress.entrance && `, подъезд ${selectedAddress.entrance}`}
                  {selectedAddress.floor && `, этаж ${selectedAddress.floor}`}
                </Typography>
                <Chip 
                  label="Изменить" 
                  onClick={() => setShowAddressModal(true)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            ) : (
              <Button 
                variant="outlined" 
                startIcon={<LocationOnIcon />}
                onClick={() => setShowAddressModal(true)}
                fullWidth
              >
                Выбрать адрес доставки
              </Button>
            )}
          </Box>

          {selectedPickupPoint?.name === DEFAULT_STATIC_PICKUP_POINT_NAME && (
            <Box mb={2} textAlign="center" py={2}>
              <Typography variant="body1" color="textSecondary">
                К сожалению, доставка по вашему адресу пока недоступна. 
                Но вы всё равно можете оформить заказ — мы сделаем всё возможное, чтобы его доставить!
              </Typography>
            </Box>
          )}

          {selectedPickupPointId && deliveryTimeData?.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Время доставки
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="delivery-time-label">Выберите время</InputLabel>
                <Controller
                  name="deliveryTimeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="delivery-time-label"
                      label="Выберите время"
                      error={!!errors.deliveryTimeId}
                      startAdornment={
                        <InputAdornment position="start">
                          <ScheduleIcon color="action" />
                        </InputAdornment>
                      }
                      renderValue={(selected) => {
                        const selectedTime = deliveryTimeData
                          .flatMap(day => day.times)
                          .find(time => time.id === selected);
                        if (!selectedTime) return null;
                        
                        const dayData = deliveryTimeData.find(day => 
                          day.times.some(t => t.id === selected)
                        );
                        
                        return `${formatToRussianDate(dayData?.date || '')}, 
                                ${selectedTime.startTime?.substring(0,5)} - 
                                ${selectedTime.endTime?.substring(0,5)}`;
                      }}
                    >
                      {deliveryTimeData.map((dayData) => [
                        <ListSubheader key={`header-${dayData.date}`}>
                          {formatToRussianDate(dayData.date)}
                        </ListSubheader>,
                        ...dayData.times.map((time) => (
                          <MenuItem 
                            key={time.id} 
                            value={time.id}
                            onClick={() => setValue("deliveryDate", dayData.date)}
                          >
                            {time.startTime?.substring(0,5)} - {time.endTime?.substring(0,5)}
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

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Контактные данные
            </Typography>
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

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Дополнительная информация
            </Typography>
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
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
            color="primary"
            size="large"
            fullWidth
            disabled={isExpiredProduct || !selectedAddress}
          >
            Оформить заказ
          </Button>
        </form>

        <AddNewAddressModal
          isOpen={false}
          onClose={() => setShowAddressModal(false)}
        />
      </Box>
    </Paper>
  );
});