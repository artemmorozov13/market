import { FormControlLabel, Switch, Typography } from '@mui/material'
import styles from './PartnersForm.module.scss'
import { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

export const PartnersForm: FC = () => {
  const { control } = useFormContext()

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Партнеры
      </Typography>
      <Controller
        name="isWorkWithPartners"
        control={control}
        render={({ field: { value, onChange } }) => (
          <FormControlLabel
            control={<Switch checked={value} onChange={onChange} />}
            label="Работаю с партнерами"
          />
        )}
      />
    </section>
  )
}
