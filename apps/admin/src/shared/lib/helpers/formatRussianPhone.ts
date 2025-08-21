export const formatToRussianPhone = (input: string): string => {
  const digits = input.replace(/\D/g, '')

  const parts = []
  if (digits.length > 0) parts.push('+7')
  if (digits.length > 1) parts.push(` (${digits.slice(1, 4)}`)
  if (digits.length > 4) parts.push(`) ${digits.slice(4, 7)}`)
  if (digits.length > 7) parts.push(`-${digits.slice(7, 9)}`)
  if (digits.length > 9) parts.push(`-${digits.slice(9, 11)}`)
  return parts.join('')
}
