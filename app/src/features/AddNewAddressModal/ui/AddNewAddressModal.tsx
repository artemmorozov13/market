import { FC, useEffect, useState, useCallback, useMemo } from "react";
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
  Stack
} from "@mui/material";
import styles from "./AddNewAddressModal.module.css";
import { useAddressSuggestions } from "../api/queryAdreess";
import { useSaveAddress } from "../api/putNewAddress";
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { useUserAddresses } from "@/entities/Addresses/api/userAddresses";

interface AddressSuggestion {
  value: string;
  data: {
    [key: string]: any;
    house_type_full?: string;
    // другие поля данных адреса
  };
}

interface AddressFormValues {
  fullAddress: string;
  entrance: string;
  floor: string;
  apartment: string;
  intercom: string;
  addressData?: any;
}



interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const validationSchema = yup.object().shape({
  fullAddress: yup.string().required("Адрес обязателен"),
  entrance: yup.string(),
  floor: yup.string(),
  apartment: yup.string(),
  intercom: yup.string(),
});

const defaultValues: AddressFormValues = {
  fullAddress: '',
  entrance: '',
  floor: '',
  apartment: '',
  intercom: '',
  addressData: null,
};

export const AddNewAddressModal: FC<AddNewAddressModalProps> = (props) => {
  const { 
    isOpen, 
    onClose 
  } = props

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [lastSelectedValue, setLastSelectedValue] = useState<AddressSuggestion | null>(null);
  
  const { control, handleSubmit, formState, reset, setValue } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues,
    mode: 'onChange'
  });

  const { errors, isValid } = formState;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
  
    return () => clearTimeout(timerId);
  }, [inputValue]);

  const { user } = useUser()
  const { refetch } = useUserAddresses(user?.user.id)
  const { suggestions, isLoading } = useAddressSuggestions(debouncedQuery);
  const { saveAddress, isSaving } = useSaveAddress();
  

  const handleClose = useCallback(() => {
    setInputValue('');
    setLastSelectedValue(null);
    reset();
    onClose();
  }, [onClose, reset]);

  const onSubmit = useCallback(async (data: AddressFormValues) => {
    try {
      await saveAddress(data as any);
      await refetch()
      handleClose();
    } catch (error) {
      console.error('Ошибка при сохранении адреса:', error);
    }
  }, [saveAddress, handleClose]);

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
    <Modal 
      open={isOpen} 
      onClose={handleClose}
      aria-labelledby="address-modal-title"
      className={styles.modal}
    >
      <Box className={styles.container}>
        <Box className={styles.formWrapper} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography 
            variant="h6" 
            id="address-modal-title"
            className={styles.title}
            gutterBottom
          >
            Добавить адрес
          </Typography>
          
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
                  filterOptions={(options) => {
                    return inputValue.trim() ? options : [];
                  }}
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
                      helperText={errors.fullAddress?.message || "Введите адрес в Санкт-Петербурге или Ленинградской области"}
                      fullWidth
                      multiline // Добавляем поддержку многострочного ввода
                      maxRows={4} // Максимальное количество строк до появления скролла
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

            {/* Остальные поля формы */}
            <Controller
              name="entrance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Подъезд"
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
                  label="Квартира"
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
              type="submit" 
              variant="contained" 
              size="large"
              disabled={!isValid || isSaving}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Сохранить адрес'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};