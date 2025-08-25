import { FC, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { TextField, MenuItem, Typography, Button } from '@mui/material'
import styles from './OrderForm.module.css'
import { OrderFormInputs } from '../types/orderFormTypes'
import { orderFormSchema } from '../lib/orderFormSchema'
import { orderFormStore } from '../store/orderFormStore'
import { observer } from 'mobx-react-lite'
import { formatToRussianPhone } from '@shared/lib/helpers/formatRussianPhone'
import { AddNewAddressModal } from '@features/AddNewAddressModal'

interface OrderFormProps {
  onSubmit: (data: OrderFormInputs) => void
}

export const OrderForm: FC<OrderFormProps> = observer(({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormInputs>({
    resolver: yupResolver(orderFormSchema),
    defaultValues: {
      address: '',
      time: '',
      phone: '',
    },
  })

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { addressesList, fetchAddressesList } = orderFormStore

  const handleAddAddress = () => {
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) {
      fetchAddressesList()
    }
  }, [isOpen])

  return (
    <div className={styles.modalContainer}>
      <Typography id="order-form-title" className={styles.modalTitle}>
        Данные о заказе
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Адрес"
              select
              fullWidth
              margin="normal"
              error={!!errors.address}
              helperText={errors.address?.message}
            >
              {addressesList.map((address) => (
                <MenuItem key={address.id} value={address.id}>
                  {`${address.city}, ${address.street}, дом ${address.house} квартира ${address.apartment}`}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="time"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Время доставки"
              type="time"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.time}
              helperText={errors.time?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={formatToRussianPhone(value)}
              onChange={(e) => onChange(formatToRussianPhone(e.target.value))}
              label="Номер телефона"
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />
        <Button variant="outlined" onClick={handleAddAddress}>
          Добавить адресс
        </Button>
        <AddNewAddressModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </form>
    </div>
  )
})
