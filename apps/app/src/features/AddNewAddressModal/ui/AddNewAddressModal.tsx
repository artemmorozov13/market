import { FC, useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  TextField, 
  Typography, 
  Modal, 
  Button,
  Autocomplete,
  CircularProgress,
  Box,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from "./AddNewAddressModal.module.css";
import { useAddressSuggestions } from "../api/queryAdreess";
import { useSaveAddress, useUpdateSelectedAddress } from "@/entities/Addresses";
import { AddressFormValues } from "../types/addressesTypes";
import { useUser } from "@/entities/User";
import { AddressType } from "@core/types/address-type";

interface AddressSuggestion {
  value: string;
  data: {
    [key: string]: any;
    house_type_full?: string;
  };
}

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressChange?: (address: AddressType) => void;
}

const validationSchema = yup.object().shape({
  fullAddress: yup.string().required("Адрес обязателен"),
  entrance: yup.string().matches(/^[0-9]*$/, "Можно вводить только цифры"),
  floor: yup.string().matches(/^[0-9]*$/, "Можно вводить только цифры"),
  apartment: yup.string().matches(/^[0-9]*$/, "Можно вводить только цифры"),
  intercom: yup.string(),
  // Новые правила валидации
  deliveryInstructions: yup.string().max(200, "Максимум 200 символов"),
  buildingName: yup.string(),
  doorCode: yup.string(),
});

const defaultValues: AddressFormValues = {
  fullAddress: '',
  entrance: '',
  floor: '',
  apartment: '',
  intercom: '',
  addressData: null,
};

export const AddNewAddressModal: FC<AddNewAddressModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddressChange 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [lastSelectedValue, setLastSelectedValue] = useState<AddressSuggestion | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const { control, handleSubmit, formState, reset, setValue, watch } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues,
    mode: 'onSubmit'
  });

  const { errors } = formState;
  const { user, refetchUser } = useUser();
  const { suggestions, isLoading } = useAddressSuggestions(debouncedQuery);
  const { saveAddress, isSaving } = useSaveAddress();
  const { updateSelectedAddress } = useUpdateSelectedAddress()

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => clearTimeout(timerId);
  }, [inputValue]);

  const handleClose = () => {
    setInputValue('');
    setLastSelectedValue(null);
    setShowNewAddressForm(false);
    reset();
    onClose();
  };

  const handleSelectExistingAddress = async (addressId: string) => {
    const selected = user?.addresses.find(a => a.id === addressId);
    if (selected) {
      await updateSelectedAddress(selected.id)
      onAddressChange?.(selected as any);
      handleClose();
      refetchUser();
    }
  };

  const onSubmitNewAddress = async (data: AddressFormValues) => {
    const result = await saveAddress(data);
    if (result && onAddressChange) {
      onAddressChange(result);
    }
    handleClose();
    refetchUser();
  };

  const addressOptions = useMemo(() => suggestions.map(suggestion => ({
    label: suggestion.value,
    value: suggestion.value,
    data: suggestion.data
  })), [suggestions]);

  const isHouseSelected = useMemo(() => {
    if (!lastSelectedValue) return false;
    return lastSelectedValue.data?.house_type_full === 'дом' || 
           /(^|\s)(д|дом)(\s|$)/i.test(lastSelectedValue.value);
  }, [lastSelectedValue]);

  return (
    <Modal open={isOpen} onClose={handleClose} className={styles.modal}>
      <Box className={styles.container}>
        <Box className={styles.formWrapper}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" className={styles.title}>
              {showNewAddressForm ? 'Добавить адрес' : 'Выберите адрес'}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {!showNewAddressForm ? (
            <>
              <List dense sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
                {user?.addresses?.map((address) => (
                  <ListItem key={address.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleSelectExistingAddress(address.id)}
                      selected={user.selectedAddress?.id === address.id}
                    >
                      <ListItemText
                        primary={address.fullAddress}
                        secondary={
                          <>
                            {address.apartment && `Кв. ${address.apartment}`}
                            {address.entrance && `, Подъезд ${address.entrance}`}
                            {address.floor && `, Этаж ${address.floor}`}
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Button 
                variant="outlined" 
                onClick={() => setShowNewAddressForm(true)}
                fullWidth
              >
                Добавить новый адрес
              </Button>
            </>
          ) : (
            <Box component="form">
              <Stack spacing={2} mt={2}>
                <Controller
                  name="fullAddress"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Autocomplete
                      freeSolo
                      options={isHouseSelected ? [] : addressOptions}
                      getOptionLabel={(option) => 
                        typeof option === 'string' ? option : option.label
                      }
                      value={value}
                      inputValue={inputValue}
                      onInputChange={(_, newValue, reason) => {
                        setInputValue(newValue);
                        if (reason !== 'reset') {
                          onChange(newValue);
                        }
                      }}
                      onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                          onChange(newValue);
                          setLastSelectedValue({
                            value: newValue,
                            data: {}
                          });
                          setValue('addressData', null);
                        } else if (newValue) {
                          onChange(newValue.value);
                          setLastSelectedValue({
                            value: newValue.value,
                            data: newValue.data
                          });
                          setValue('addressData', newValue.data);
                        } else {
                          onChange('');
                          setLastSelectedValue(null);
                          setValue('addressData', null);
                        }
                      }}
                      loading={isLoading}
                      filterOptions={(options) => options}
                      className={styles.autocompleteContainer}
                      PaperComponent={({ children }) => (
                        <div className={styles.autocompletePaper}>
                          {children}
                        </div>
                      )}
                      renderOption={(props, option) => (
                        <li {...props} className={styles.autocompleteOption}>
                          {typeof option === 'string' ? option : option.label}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...field}
                          label="Полный адрес *"
                          error={!!errors.fullAddress}
                          helperText={errors.fullAddress?.message || "Введите адрес в Москве или Московской области"}
                          fullWidth
                          multiline
                          maxRows={4}
                          InputProps={{
                            ...params.InputProps,
                            classes: {
                              root: styles.autocompleteInputRoot,
                              input: styles.autocompleteInput,
                            },
                            endAdornment: (
                              <>
                                {isLoading && <CircularProgress size={20} />}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      noOptionsText={
                        isHouseSelected 
                          ? 'Адрес дома выбран'
                          : inputValue.trim() 
                            ? isLoading 
                              ? 'Загрузка...' 
                              : 'Ничего не найдено'
                            : 'Введите адрес для поиска'
                      }
                    />
                  )}
                />

                <Controller
                  name="entrance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Парадная"
                      error={!!errors.entrance}
                      helperText={errors.entrance?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Этаж"
                      error={!!errors.floor}
                      helperText={errors.floor?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="apartment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Квартира/Офис"
                      error={!!errors.apartment}
                      helperText={errors.apartment?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="intercom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Домофон"
                      error={!!errors.intercom}
                      helperText={errors.intercom?.message}
                      fullWidth
                    />
                  )}
                />

                <Button 
                  type="button" 
                  variant="contained" 
                  size="large"
                  disabled={isSaving}
                  onClick={handleSubmit(onSubmitNewAddress)}
                  fullWidth
                >
                  {isSaving ? <CircularProgress size={24} /> : 'Сохранить адрес'}
                </Button>

                <Button 
                  variant="text" 
                  onClick={() => setShowNewAddressForm(false)}
                  fullWidth
                >
                  Вернуться к списку адресов
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};