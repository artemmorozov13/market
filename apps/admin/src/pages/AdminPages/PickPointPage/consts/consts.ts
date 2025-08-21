import { DayOption, TimeOption } from '@entities/DeliveryArea'

export const timeOptions: TimeOption[] = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = (i % 2) * 30
  const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  return {
    value: timeValue,
    label: timeValue,
  }
})

export const filterTimeOptions = (
  options: TimeOption[],
  startTime: string | null,
  endTime: string | null,
  excludeTimes: string[] = [],
): TimeOption[] => {
  return options.filter((option) => {
    if (excludeTimes.includes(option.value)) {
      return false
    }

    if (startTime !== null && endTime) {
      return option.value < endTime
    }

    if (endTime !== null && startTime) {
      return option.value > startTime
    }

    return true
  })
}

export const dayOptions: DayOption[] = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' },
]
