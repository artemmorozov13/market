import { SelectOptionType } from '@/shared/ui/Select/types'
import { Select, MenuItem } from '@mui/material'
import { FC } from 'react'

interface AddressesSelectProps {
  options: SelectOptionType[]
  value: SelectOptionType | null
  onChange: (value: SelectOptionType | null) => void
  placeholder?: string
}

export const AddressesSelect: FC<AddressesSelectProps> = (props) => {
  const { options, value, onChange, placeholder = 'Выберите адрес' } = props

  const handleChange = (event: any) => {
    const selectedValue = event.target.value
    const selectedOption = options.find((opt) => opt.value === selectedValue) || null
    onChange(selectedOption)
  }

  return (
    <Select
      value={value?.value || ''}
      onChange={handleChange}
      displayEmpty
      fullWidth
      renderValue={(selected) => {
        if (!selected) {
          return <em>{placeholder}</em>
        }
        return options.find((opt) => opt.value === selected)?.label || selected
      }}
    >
      <MenuItem disabled value="">
        <em>{placeholder}</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}
