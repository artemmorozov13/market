import { TextField, Typography } from '@mui/material'
import styles from './HelpForm.module.scss'
import { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

export const HelpForm: FC = () => {
  const { control } = useFormContext()

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Поддержка
      </Typography>
      <Controller
        name="helpTelegramAccount"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField
            value={value}
            onChange={onChange}
            label="Аккаунт поддержки телеграм"
            placeholder="Например: @morozov4"
            className={styles.helpForm}
            fullWidth
          />
        )}
      />
    </section>
  )
}
