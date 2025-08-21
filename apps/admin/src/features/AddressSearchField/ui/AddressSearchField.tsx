import { FC, useEffect, useState } from 'react'
import { Control, Controller, FieldError } from 'react-hook-form'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import { useAddressSuggestions } from '../api/queryAdreess'

interface AddressSearchFieldProps {
  control: Control<any>
  name: string
  label: string
  value: string
  error?: FieldError
  onAddressSelect?: (data: any) => void
}

export const AddressSearchField: FC<AddressSearchFieldProps> = (props) => {
  const { control, name, label, value, error, onAddressSelect } = props

  const [inputValue, setInputValue] = useState(value || '')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedOption, setSelectedOption] = useState<any>(value)
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectAddress = (data: any) => {
    onAddressSelect?.(data)
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(inputValue)
    }, 500)

    return () => clearTimeout(timerId)
  }, [inputValue])

  const { suggestions, isLoading } = useAddressSuggestions(debouncedQuery)

  const addressOptions = suggestions.map((suggestion) => ({
    label: suggestion.value,
    value: suggestion.value,
    data: suggestion.data,
  }))

  const isHouseSelected = selectedOption?.data?.house

  // Добавляем эффект для синхронизации внешнего значения
  useEffect(() => {
    if (value) {
      setInputValue(value)
    }
  }, [value])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <Autocomplete
          freeSolo
          options={addressOptions}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          value={value}
          inputValue={inputValue}
          onInputChange={(_, newValue, reason) => {
            setInputValue(newValue)
            if (reason !== 'reset') {
              onChange(newValue)
            }
            // Открываем список только при вводе, если не выбран дом
            if (!isHouseSelected && newValue.length > 2) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string') {
              onChange(newValue)
              handleSelectAddress(null)
              setSelectedOption(null)
            } else if (newValue) {
              onChange(newValue.value)
              handleSelectAddress(newValue.data)
              setSelectedOption(newValue)
              setIsOpen(false) // Закрываем список после выбора
            } else {
              onChange('')
              handleSelectAddress(null)
              setSelectedOption(null)
            }
          }}
          onFocus={() => {
            // Открываем список только если есть введенный текст и не выбран дом
            if (!isHouseSelected && inputValue.length > 2) {
              setIsOpen(true)
            }
          }}
          onBlur={() => setIsOpen(false)}
          loading={isLoading}
          filterOptions={(options) => options}
          open={isOpen}
          renderInput={(params) => (
            <TextField
              {...params}
              {...field}
              label={label}
              error={!!error}
              helperText={error?.message}
              fullWidth
              InputProps={{
                ...params.InputProps,
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
            inputValue.trim()
              ? isLoading
                ? 'Загрузка...'
                : 'Ничего не найдено'
              : 'Введите адрес для поиска'
          }
        />
      )}
    />
  )
}
