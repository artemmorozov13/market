import { FC } from 'react'
import styles from './AuthForm.module.scss'
import {
  Alert,
  Avatar,
  Button,
  CssBaseline,
  FormControl,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { AuthFormSchema } from '../types/formTypes'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { authValidationSchema } from '../lib/authValidationSchema'
import { postUserAuth } from '../api/postUserAuth'

export const AuthForm: FC = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormSchema>({
    mode: 'all',
    resolver: yupResolver(authValidationSchema),
  })

  const onSubmit = (data: AuthFormSchema) => {
    postUserAuth({
      body: data,
      navigate,
    })
  }

  return (
    <div className={styles.main}>
      <CssBaseline />
      <Paper className={styles.paper}>
        <div className={styles.container}>
          <Avatar className={styles.avatar}>
            <HowToRegIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Авторизация
          </Typography>
        </div>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth>
            <Controller
              name="email"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  variant="outlined"
                  id="email"
                  name="email"
                  value={value}
                  onChange={onChange}
                  autoComplete="email"
                  placeholder={'email'}
                  autoFocus
                />
              )}
            />
            {errors?.email?.message && <Alert severity="error">{errors.email.message}</Alert>}
          </FormControl>
          <FormControl fullWidth>
            <Controller
              name="password"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  variant="outlined"
                  id="password"
                  name="password"
                  type="password"
                  value={value}
                  onChange={onChange}
                  placeholder={'Пароль...'}
                />
              )}
            />
            {errors?.password?.message && <Alert severity="error">{errors.password.message}</Alert>}
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={styles.submit}
          >
            Войти
          </Button>
        </form>
      </Paper>
    </div>
  )
}
