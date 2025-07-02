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
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider
} from "@mui/material";
import styles from "./OrderForm.module.scss";
import { observer } from "mobx-react-lite";
import { formatToRussianPhone } from "@/shared/helpers/formatRussianPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import CommentIcon from "@mui/icons-material/Comment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";
import { basketStore } from "@/entities/Basket";
import { DEFAULT_STATIC_PICKUP_POINT_NAME } from "@/shared/consts/applicationConsts";
import { useUpdateUser, useUser } from "@/entities/User";
import { useDeliveryTimes } from "@/entities/DeliveryTime";
import { formatToRussianDate } from "@/shared/helpers/formatToRussianDate";
import { ProductStatusEnum } from "@core/enums/product-status-enum";
import { AddNewAddressModal } from "@/features/AddNewAddressModal";
import { useSearchParams } from "react-router-dom";
import { ManageAddressForm } from "@/features/ManageAddressForm";
import { findNearestDeliveryArea } from "@/shared/helpers/findNearestPickupPoint";
import { useDeliveryAreas } from "@/entities/DeliveryArea";
import { useStore } from "@/entities/Store";
import { OrderFormInputs } from "../types/orderFormTypes";
import { getOrderFormSchema } from "../lib/orderFormSchema";
import { AddressType } from "@core/types/address-type";
import { DayOfWeek, PickupPointType } from "@core/types/pickup-point-type";
import { DeliveryStrategyEnum } from "@core/enums/delivery-strategy.enum";

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void;
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId');

  const { store } = useStore(storeId);
  const { deliveryAreas, isLoadingDeliveryArea } = useDeliveryAreas(storeId);
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

  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  
  // Сначала получаем методы формы без схемы валидации
  const { control, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<OrderFormInputs>({
    defaultValues: {
      phone: user?.phone_number || '',
      comment: "",
      deliveryAreaId: null,
      deliveryTimeId: null,
      deliveryDate: null,
      addressId: null,
      deliveryMethod: null,
      pickupPointId: null,
      deliveryStrategy: null,
      storeId: Number(storeId),
    },
  });

  // Затем получаем текущий метод доставки
  const deliveryMethod = watch("deliveryMethod");
  
  // Динамически создаем схему валидации на основе метода доставки
  const schema = useMemo(() => getOrderFormSchema(deliveryMethod), [deliveryMethod]);

  // Обновляем resolver при изменении схемы
  useEffect(() => {
    trigger(); // Перезапускаем валидацию при изменении схемы
  }, [schema, trigger]);

  const selectedDeliveryAreaId = watch("deliveryAreaId");
  const selectedAddressId = watch("addressId");
  const pickupPointId = watch("pickupPointId");
  const { deliveryTimeData } = useDeliveryTimes(selectedDeliveryAreaId);
  const { updateUser } = useUpdateUser();
  const { addresses } = useUserAddresses();

  // Get available delivery strategies from store
  const availableDeliveryStrategies = useMemo(() => {
    // @ts-ignore
    return store?.deliveryStrategies?.map((s) => s.strategy.type) || [];
  }, [store?.deliveryStrategies]);

  // Check if delivery is available
  const isDeliveryAvailable = useMemo(() => {
    return availableDeliveryStrategies.includes(DeliveryStrategyEnum.DeliveryToEntrance);
  }, [availableDeliveryStrategies]);

  // Check if pickup is available
  const isPickupAvailable = useMemo(() => {
    return availableDeliveryStrategies.includes(DeliveryStrategyEnum.PickupByYourself);
  }, [availableDeliveryStrategies]);

  // Active pickup points
  const activePickupPoints = useMemo(() => {
    return store?.pickupPoints?.filter(point => point.status === "active") || [];
  }, [store?.pickupPoints]);

  const selectedAddress = useMemo(() => {
    return addresses?.find(addr => addr.id === selectedAddressId) || user?.selectedAddress;
  }, [addresses, selectedAddressId, user?.selectedAddress]);

  const hasAvailableDeliveryTimes = useMemo(() => {
    if (!deliveryTimeData) return false;
    return deliveryTimeData.some(day => day.times.length > 0);
  }, [deliveryTimeData]);

  const confirmForm = (data: OrderFormInputs) => {
    if (selectedAddress?.id) {
      onSubmit({
        ...data,
        address: selectedAddress,
        addressId: selectedAddress.id 
      });
    }
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
  };

  // Set default delivery method on first load
  useEffect(() => {
    if (!deliveryMethod) {
      if (isDeliveryAvailable && isPickupAvailable) {
        setValue("deliveryMethod", "delivery");
      } else if (isDeliveryAvailable) {
        setValue("deliveryMethod", "delivery");
      } else if (isPickupAvailable) {
        setValue("deliveryMethod", "pickup");
      }
    }
  }, [isDeliveryAvailable, isPickupAvailable, deliveryMethod, setValue]);

  useEffect(() => {
    if (selectedAddress && deliveryAreas?.length && deliveryMethod === "delivery") {
      const nearestPoint = findNearestDeliveryArea(selectedAddress, deliveryAreas);
      if (nearestPoint) {
        setValue("deliveryAreaId", nearestPoint.id);
        setValue("deliveryTimeId", null);
      } else {
        setValue("deliveryAreaId", null);
        setValue("deliveryTimeId", null);
      }
    }
  }, [selectedAddress, deliveryAreas, setValue, deliveryMethod]);

  useEffect(() => {
    if (deliveryMethod === "pickup" && activePickupPoints.length > 0 && !pickupPointId) {
      setValue("pickupPointId", activePickupPoints[0].id);
    }
  }, [deliveryMethod, activePickupPoints, pickupPointId, setValue]);

  const isExpiredProduct = basketStore.basketList.some(
    item => item.product.status === ProductStatusEnum.Expired
  );

  const selectedDeliveryArea = deliveryAreas?.find(p => p.id === selectedDeliveryAreaId);
  const selectedPickupPoint = activePickupPoints.find(p => p.id === pickupPointId);

  const deliveryCostInfo = store?.isDeliveryFree 
    ? "Бесплатная доставка" 
    : `Стоимость доставки: ${store?.deliveryCost} ₽${store?.deliveryFreeFromLimit ? ` (бесплатно от ${store.deliveryFreeFromLimit} ₽)` : ''}`;

  if (isLoadingDeliveryArea) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Format working hours for display
  const formatWorkingHours = (point: PickupPointType) => {
    if (!point.workingHours || point.workingHours.length === 0) {
      return "Часы работы не указаны";
    }
    
    const daysMap: Record<DayOfWeek, string> = {
      monday: "Пн",
      tuesday: "Вт",
      wednesday: "Ср",
      thursday: "Чт",
      friday: "Пт",
      saturday: "Сб",
      sunday: "Вс"
    };

    return point.workingHours
      .map(hour => `${daysMap[hour.dayOfWeek]}: ${hour.openingTime.slice(0,5)}-${hour.closingTime.slice(0,5)}`)
      .join(", ");
  };

  return (
    <Paper className={styles.paper}>
      <Box className={styles.modalContainer}>
        <form onSubmit={handleSubmit(confirmForm)}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
              Способ получения
            </Typography>

            {!isDeliveryAvailable && !isPickupAvailable && (
              <Alert severity="error" className={styles.alert}>
                <Typography variant="body1" gutterBottom>
                  В настоящее время заказы недоступны
                </Typography>
                <Typography variant="body2">
                  К сожалению, в данный момент мы не можем принять ваш заказ. 
                  Пожалуйста, попробуйте позже или свяжитесь с нами для уточнения деталей.
                </Typography>
              </Alert>
            )}
            
            <Controller
              name="deliveryMethod"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} className={styles.deliveryMethodGroup}>
                  {isDeliveryAvailable && (
                    <Paper variant="outlined" className={styles.deliveryMethodCard}>
                      <FormControlLabel
                        value="delivery"
                        control={<Radio />}
                        label={
                          <Box className={styles.deliveryMethodLabel}>
                            <LocalShippingIcon className={styles.deliveryMethodIcon} />
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                Доставка
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {deliveryCostInfo}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        className={styles.deliveryMethodOption}
                      />
                    </Paper>
                  )}
                  
                  {isPickupAvailable && (
                    <Paper variant="outlined" className={styles.deliveryMethodCard}>
                      <FormControlLabel
                        value="pickup"
                        control={<Radio />}
                        label={
                          <Box className={styles.deliveryMethodLabel}>
                            <StoreIcon className={styles.deliveryMethodIcon} />
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                Самовывоз
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Бесплатно из нашего магазина
                              </Typography>
                            </Box>
                          </Box>
                        }
                        className={styles.deliveryMethodOption}
                      />
                    </Paper>
                  )}
                </RadioGroup>
              )}
            />
          </Box>

          {deliveryMethod === "delivery" && isDeliveryAvailable ? (
            <>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
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
                    className={styles.addAddressBtn}
                  >
                    Добавить адрес доставки
                  </Button>
                )}
                {errors.addressId && (
                  <Typography variant="body2" color="error" className={styles.errorText}>
                    {errors.addressId.message}
                  </Typography>
                )}
              </Box>

              {selectedDeliveryArea?.name === DEFAULT_STATIC_PICKUP_POINT_NAME && (
                <Box mb={2} className={styles.deliveryWarning}>
                  <Typography variant="body1" color="textSecondary">
                    К сожалению, доставка по вашему адресу пока недоступна. 
                    Но вы всё равно можете оформить заказ — мы сделаем всё возможное, чтобы его доставить!
                  </Typography>
                </Box>
              )}

              {selectedDeliveryAreaId && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
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
                                <ScheduleIcon />
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
                            className={styles.selectField}
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
                                  className={styles.menuItem}
                                >
                                  {time.startTime?.substring(0,5)} - {time.endTime?.substring(0,5)}
                                </MenuItem>
                              ))
                            ])}
                          </Select>
                        )}
                      />
                      {errors.deliveryTimeId && (
                        <Typography variant="body2" color="error" className={styles.errorText}>
                          {errors.deliveryTimeId.message}
                        </Typography>
                      )}
                    </FormControl>
                  ) : (
                    <Alert severity="info" className={styles.alert}>
                      К сожалению, на этой неделе нет доступных интервалов для доставки.
                      Пожалуйста, попробуйте оформить заказ позже или выберите другой адрес доставки.
                    </Alert>
                  )}
                </Box>
              )}
            </>
          ) : deliveryMethod === "pickup" && isPickupAvailable ? (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
                Пункт самовывоза
              </Typography>
              
              {activePickupPoints.length > 0 ? (
                <>
                  <FormControl fullWidth margin="normal" error={!!errors.pickupPointId}>
                    <InputLabel id="pickup-point-label">Выберите пункт самовывоза</InputLabel>
                    <Controller
                      name="pickupPointId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="pickup-point-label"
                          label="Выберите пункт самовывоза"
                          startAdornment={
                            <InputAdornment position="start">
                              <StoreIcon />
                            </InputAdornment>
                          }
                          className={styles.selectField}
                        >
                          {activePickupPoints.map((point) => (
                            <MenuItem 
                              key={point.id} 
                              value={point.id}
                              className={styles.menuItem}
                            >
                              <Box>
                                <Typography fontWeight={500}>{point.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {point.fullAddress}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.pickupPointId && (
                      <Typography variant="body2" color="error" className={styles.errorText}>
                        {errors.pickupPointId.message}
                      </Typography>
                    )}
                  </FormControl>
                  
                  {selectedPickupPoint && (
                    <Paper variant="outlined" className={styles.pickupInfoCard} sx={{ mt: 2 }}>
                      <Box className={styles.pickupInfoContent}>
                        <StoreIcon className={styles.pickupIcon} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {formatWorkingHours(selectedPickupPoint)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </>
              ) : (
                <Alert severity="warning" className={styles.alert}>
                  Нет доступных пунктов самовывоза
                </Alert>
              )}
            </Box>
          ) : null}

          <Divider className={styles.divider} />

          <Box mb={3}>
            <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
              Контактные данные
            </Typography>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  value={formatToRussianPhone(value || '')}
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
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  className={styles.textField}
                />
              )}
            />
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
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
                        <CommentIcon />
                      </InputAdornment>
                    ),
                  }}
                  className={styles.textField}
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
            disabled={
              isExpiredProduct || 
              !deliveryMethod ||
              (deliveryMethod === "delivery" && (!selectedAddress || !hasAvailableDeliveryTimes)) ||
              (deliveryMethod === "pickup" && activePickupPoints.length === 0)
            }
            className={styles.submitButton}
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