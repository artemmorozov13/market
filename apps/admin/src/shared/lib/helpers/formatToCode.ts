export const formatToCode = (input: string): string => {
  const numericInput = input.replace(/\D/g, '')
  const limitedInput = numericInput.slice(0, 4)
  const formatted = limitedInput.split('').join(' - ')

  return formatted
}
