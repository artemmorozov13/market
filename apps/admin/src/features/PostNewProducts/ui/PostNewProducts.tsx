import React, { useState } from 'react';
import { useForm, Controller, UseFormReturn, ControllerRenderProps } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Box, Typography } from '@mui/material';
import { productSchema } from '../lib/productValidationSchema';
import styles from './PostNewProducts.module.scss';
import { ProductFormType } from '../types/postNewProductTypes';
import { Uploader } from '@entities/Uploader/ui/Uploader';
import { UploaderReturnType } from '@core/types/uploader-type';

interface ProductFormProps {
  initialValues?: ProductFormType
  onSubmit?: (data: ProductFormType, methods: UseFormReturn<ProductFormType, any, undefined>) => void;
}

export const ProductForm: React.FC<ProductFormProps> = (props) => {
  const { onSubmit, initialValues } = props
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const methods = useForm<ProductFormType>({
    resolver: yupResolver(productSchema) as any,
    defaultValues: initialValues || {
      name: '',
      description: '',
      price: '',
      discount: '',
      unitValue: '',
      image: '',
      unitOfMeasurement: 'шт',
    } as any,
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods

  const handleFileChange = (onChange: (fileUrl: UploaderReturnType) => void) => (file: UploaderReturnType) => {
    onChange(file)
  };

  const handleFormSubmit = (data: ProductFormType) => {
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 1000);
    onSubmit?.(data, methods)
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.wrapper}
    >
      <span className={styles.title}>{initialValues ? 'Редактировать продукт' : 'Добавить продукт'}</span>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Название продукта"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Описание продукта"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Цена продукта"
            type="number"
            error={!!errors.price}
            helperText={errors.price?.message}
          />
        )}
      />
      <Controller
        name="discount"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Скидка"
            type="number"
            inputProps={{
              min: 0,
              max: 100,
            }}
            error={!!errors.discount}
            helperText={errors.discount?.message}
          />
        )}
      />
      <Box>
        <Controller
          name='image'
          control={control}
          render={({ field: { value, onChange } }) => (
            <Uploader
              value={value}
              onChange={handleFileChange(onChange)}
            />
          )}
        />
        {errors.image && (
          <Typography color="error" variant="body2">
            {errors.image?.message}
          </Typography>
        )}
      </Box>
      <Controller
        name="unitValue"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Величина еденицы"
            error={!!errors.unitValue}
            helperText={errors.unitValue?.message}
          />
        )}
      />
      <Controller
        name="unitOfMeasurement"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Единица измерения"
            select
            SelectProps={{
              native: true,
            }}
            error={!!errors.unitOfMeasurement}
            helperText={errors.unitOfMeasurement?.message}
          >
            <option value="гр">гр</option>
            <option value="кг">кг</option>
            <option value="шт">шт</option>
          </TextField>
        )}
      />
      <Button type="submit" variant="contained" color="primary" disabled={isDisabled}>
        {initialValues ? 'Сохранить' : 'Добавить'}
      </Button>
    </Box>
  );
};
