import { FC } from 'react'
import {
  Alert,
  Button,
  CssBaseline,
  FormControl,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { RegisterFormSchema } from '../types/registrationStateSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerValidationSchema } from '../lib/registerValidationSchema'
import styles from './RegisterForm.module.scss'
import { postNewUser } from '../api/postNewUser'
import { routeConfig } from '@shared/lib/consts/routeConfig'

export const RegisterForm: FC = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    mode: 'all',
    resolver: yupResolver(registerValidationSchema),
  })

  const onSubmit = (data: RegisterFormSchema) => {
    postNewUser({
      body: data,
      navigate,
    })
  }

  return (
    <div className={styles.main}>
      <CssBaseline />
      <Paper className={styles.paper}>
        <div className={styles.container}>
          <HowToRegIcon />
          <Typography component="h1" variant="h5">
            Зарегестрироваться
          </Typography>
        </div>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth>
            <Controller
              name="shopName"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  value={value}
                  onChange={onChange}
                  variant="outlined"
                  id="shopName"
                  name="shopName"
                  autoComplete="shopName"
                  placeholder="shopName"
                />
              )}
            />
            {errors?.shopName?.message && <Alert severity="error">{errors.shopName.message}</Alert>}
          </FormControl>
          <FormControl fullWidth>
            <Controller
              name="username"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  variant="outlined"
                  id="username"
                  name="username"
                  value={value}
                  onChange={onChange}
                  autoComplete="username"
                  placeholder="username"
                />
              )}
            />
            {errors?.username?.message && <Alert severity="error">{errors.username.message}</Alert>}
          </FormControl>
          <div className={styles.flex}>
            <FormControl fullWidth>
              <Controller
                name="firstName"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    variant="outlined"
                    id="firstName"
                    name="firstName"
                    value={value}
                    onChange={onChange}
                    autoComplete="firstName"
                    placeholder="Имя"
                  />
                )}
              />
              {errors?.firstName?.message && (
                <Alert severity="error">{errors.firstName.message}</Alert>
              )}
            </FormControl>
            <FormControl fullWidth>
              <Controller
                name="lastName"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    variant="outlined"
                    id="lastName"
                    name="lastName"
                    value={value}
                    onChange={onChange}
                    autoComplete="lastName"
                    placeholder="Фамилия"
                  />
                )}
              />
              {errors?.lastName?.message && (
                <Alert severity="error">{errors.lastName.message}</Alert>
              )}
            </FormControl>
          </div>
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
                  placeholder="Пароль"
                />
              )}
            />
            {errors?.password?.message && <Alert severity="error">{errors.password.message}</Alert>}
          </FormControl>
          <FormControl fullWidth>
            <Controller
              name="passwordRepeat"
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  variant="outlined"
                  id="passwordRepeat"
                  name="passwordRepeat"
                  type="password"
                  value={value}
                  onChange={onChange}
                  placeholder="Повторите пароль"
                />
              )}
            />
            {errors?.passwordRepeat?.message && (
              <Alert severity="error">{errors.passwordRepeat.message}</Alert>
            )}
          </FormControl>
          <div className={styles.alreadyLoginBlock}>
            <Typography>Уже зарегестрированы?</Typography>
            <Link to={routeConfig['login']} className={styles.link}>
              Войти
            </Link>
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={styles.submit}
          >
            Зарегестрироваться
          </Button>
        </form>
      </Paper>
    </div>
  )
}
