import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { useForm, Controller, UseFormSetValue } from "react-hook-form";
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
import { useUser } from "@/app/providers/AuthProvider/api/fetchUserData";
import { OrderFormInputs } from "@/features/OrderForm/types/orderFormTypes";
import { AddressType, useSaveAddress } from "@/entities/Addresses";
import { AddressFormValues } from "../types/addressesTypes";

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
}

const validationSchema = yup.object().shape({
  fullAddress: yup.string(),
  entrance: yup
    .string()
    .matches(/^[0-9]*$/, "Можно вводить только цифры"),
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
    onClose,
  } = props

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [lastSelectedValue, setLastSelectedValue] = useState<AddressSuggestion | null>(null);
  
  const { control, handleSubmit, formState, reset, setValue } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues,
    mode: 'onSubmit'
  });

  const { errors } = formState;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
  
    return () => clearTimeout(timerId);
  }, [inputValue]);

  const { suggestions, isLoading } = useAddressSuggestions(debouncedQuery);
  const { saveAddress, isSaving } = useSaveAddress();
  const { refetchUser } = useUser()
  
  const handleClose = () => {
    setInputValue('');
    setLastSelectedValue(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: AddressFormValues) => {
      const response = await saveAddress(data,);
      const addressValue = {
        id: response.id,
        apartment: response.apartment,
        comment: response.comment,
        entrance: response.entrance,
        fias_id: response.fias_id,
        floor: response.floor,
        fullAddress: response.fullAddress,
        geo_lat: response.geo_lat,
        geo_lon: response.geo_lon,
        intercom: response.intercom,
        postal_code: response.postal_code,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      handleClose();
      refetchUser()
  }

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
                  label="Парадная"
                  error={!!errors.entrance}
                  helperText={errors.entrance?.message}
                  fullWidth
                />
              )}
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? <CircularProgress size={24} /> : 'Сохранить адрес'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};