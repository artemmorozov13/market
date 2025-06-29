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
  Alert
} from "@mui/material";
import styles from "./OrderForm.module.scss";
import { OrderFormInputs, DeliveryArea } from "../types/orderFormTypes";
import { orderFormSchema } from "../lib/orderFormSchema";
import { observer } from "mobx-react-lite";
import { formatToRussianPhone } from "@/shared/helpers/formatRussianPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import CommentIcon from "@mui/icons-material/Comment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { API } from "@/shared/api/API";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";
import { basketStore } from "@/entities/Basket";
import { DEFAULT_STATIC_PICKUP_POINT_NAME } from "@/shared/consts/applicationConsts";
import { userStore, useUpdateUser, useUser } from "@/entities/User";
import { useDeliveryTimes } from "@/entities/DeliveryTime";
import { formatToRussianDate } from "@/shared/helpers/formatToRussianDate";
import { ProductStatusEnum } from "@core/enums/product-status-enum";
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useSearchParams } from "react-router";
import { ManageAddressForm } from "@/features/ManageAddressForm";
import { AddressType } from "@core/types/address-type";
import { findNearestDeliveryArea } from "@/shared/helpers/findNearestPickupPoint";
import { useDeliveryAreas } from "@/entities/DeliveryArea";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId');

  const { deliveryAreas, isLoadingDeliveryArea } = useDeliveryAreas(storeId)
  const { user } = useUser({ 
    onSuccess: () => {
      if (user?.phone_number) {
        setValue('phone', user.phone_number);
      }
      if (user?.selectedAddress) {
        setValue('addressId', user.selectedAddress.id);
      }
    }
  });

  const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
  const { selectedStore } = userStore;
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<OrderFormInputs>({
    resolver: yupResolver(orderFormSchema) as any,
    defaultValues: {
      phone: user?.phone_number,
      comment: "",
      deliveryAreaId: null,
      deliveryTimeId: null,
      deliveryDate: null,
      addressId: null
    },
  });

  const selectedDeliveryAreaId = watch("deliveryAreaId");
  const selectedAddressId = watch("addressId");
  const { deliveryTimeData } = useDeliveryTimes(selectedDeliveryAreaId);
  const { updateUser } = useUpdateUser();
  const { addresses } = useUserAddresses();

  const selectedAddress = useMemo(() => {
    return addresses?.find(addr => addr.id === selectedAddressId) || user?.selectedAddress;
  }, [addresses, selectedAddressId, user?.selectedAddress]);

  // Проверяем есть ли доступные интервалы доставки
  const hasAvailableDeliveryTimes = useMemo(() => {
    if (!deliveryTimeData) return false;
    return deliveryTimeData.some(day => day.times.length > 0);
  }, [deliveryTimeData]);

  const confirmForm = (data: OrderFormInputs) => {
    onSubmit({
      ...data,
      address: user?.selectedAddress || null,
      addressId: user?.selectedAddressId as any,
      deliveryDate: data.deliveryDate,
      storeId: selectedStore?.id || Number(storeId)
    });
    updateUser({ phone_number: data.phone });
  };

  const handleAddressChange = (address: AddressType) => {
    if (address && deliveryAreas?.length) {
      const nearestPoint = findNearestDeliveryArea(address, deliveryAreas);
      if (nearestPoint) {
        setValue("deliveryAreaId", nearestPoint.id);
        setValue("deliveryTimeId", null);
      }
    }
  }

  useEffect(() => {
    if (selectedAddress && deliveryAreas?.length) {
      const nearestPoint = findNearestDeliveryArea(selectedAddress, deliveryAreas);
      if (nearestPoint) {
        setValue("deliveryAreaId", nearestPoint.id);
        setValue("deliveryTimeId", null);
      } else {
        setValue("deliveryAreaId", null);
        setValue("deliveryTimeId", null);
      }
    }
  }, [selectedAddress, deliveryAreas, setValue]);

  const isExpiredProduct = basketStore.basketList.some(
    item => item.product.status === ProductStatusEnum.Expired
  );

  if (isLoadingDeliveryArea) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedDeliveryArea = deliveryAreas?.find(p => p.id === selectedDeliveryAreaId);

  return (
    <Paper className={styles.paper}>
      <Box className={styles.modalContainer}>
        <form onSubmit={handleSubmit(confirmForm)}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Адрес доставки
            </Typography>
            
            {selectedAddress ? (
              <ManageAddressForm onAddressChange={handleAddressChange} />
            ) : (
              <Button 
                variant="outlined" 
                startIcon={<LocationOnIcon />}
                onClick={() => setShowAddressModal(true)}
                fullWidth
              >
                Добавить адрес доставки
              </Button>
            )}
          </Box>

          {selectedDeliveryArea?.name === DEFAULT_STATIC_PICKUP_POINT_NAME && (
            <Box mb={2} textAlign="center" py={2}>
              <Typography variant="body1" color="textSecondary">
                К сожалению, доставка по вашему адресу пока недоступна. 
                Но вы всё равно можете оформить заказ — мы сделаем всё возможное, чтобы его доставить!
              </Typography>
            </Box>
          )}

          {selectedDeliveryAreaId && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Время доставки
              </Typography>
              
              {hasAvailableDeliveryTimes ? (
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
                            ?.flatMap(day => day.times)
                            .find(time => time.id === selected);
                          if (!selectedTime) return null;
                          
                          const dayData = deliveryTimeData?.find(day => 
                            day.times.some(t => t.id === selected)
                          );
                          
                          return `${formatToRussianDate(dayData?.date || '')}, 
                                  ${selectedTime.startTime?.substring(0,5)} - 
                                  ${selectedTime.endTime?.substring(0,5)}`;
                        }}
                      >
                        {deliveryTimeData?.map((dayData) => [
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
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  К сожалению, на этой неделе нет доступных интервалов для доставки.
                  Пожалуйста, попробуйте оформить заказ позже или выберите другой адрес доставки.
                </Alert>
              )}
            </Box>
          )}

          {/* Остальные поля формы остаются без изменений */}
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
            disabled={isExpiredProduct || !selectedAddress || !hasAvailableDeliveryTimes}
          >
            Оформить заказ
          </Button>
        </form>

        <AddNewAddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
        />
      </Box>
    </Paper>
  );
});