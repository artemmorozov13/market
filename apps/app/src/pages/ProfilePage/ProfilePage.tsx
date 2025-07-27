import { useUpdateUser, useUser } from "@/entities/User";
import { Layout } from "@/widgets/Layout";
import { FC, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { LoginButton, TelegramAuthData } from '@telegram-auth/react';
import styles from "./ProfilePage.module.scss";
import clsx from "clsx";

type FormData = {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  age: number | null;
};

const ProfilePage: FC = () => {
  const { user } = useUser();
  const { updateUser } = useUpdateUser()

  const [isEditing, setIsEditing] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      name: user?.name || null,
      email: user?.email || null,
      phone_number: user?.phone_number || null,
      age: user?.age || null,
    },
  });

  const onSubmit = (data: FormData) => {
    updateUser(data)
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleTelegramAuth = (data: TelegramAuthData) => {
    console.log("Данные авторизации Telegram:", data);
    // Обработка данных авторизации Telegram
  };

  if (!user) {
    return (
      <Layout>
        <Typography variant="h6">Загрузка данных пользователя...</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper elevation={3} className={styles.profileContainer}>
        <Box className={styles.profileHeader}>
          <Avatar
            sx={{ width: 100, height: 100 }}
            className={styles.avatar}
          />
          <Typography variant="h4" className={styles.userName}>
            {user.name || "Анонимный пользователь"}
          </Typography>
          {!isEditing && (
            <IconButton
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Divider className={styles.divider} />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formContainer}
        >
          <Box className={styles.formSection}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Личная информация
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Полное имя"
                  variant="outlined"
                  fullWidth
                  disabled={!isEditing}
                  className={styles.formField}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Некорректный email",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  disabled={!isEditing}
                  className={styles.formField}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="phone_number"
              control={control}
              rules={{
                pattern: {
                  value: /^\+?[\d\s-]+$/,
                  message: "Некорректный номер телефона",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Номер телефона"
                  variant="outlined"
                  fullWidth
                  disabled={!isEditing || user.is_phone_confirmed}
                  className={clsx(styles.formField, {
                    [styles.confirmedField]: user.is_phone_confirmed,
                  })}
                  error={!!errors.phone_number}
                  helperText={
                    user.is_phone_confirmed
                      ? "Номер подтвержден"
                      : errors.phone_number?.message
                  }
                  InputProps={{
                    endAdornment: user.is_phone_confirmed && (
                      <Typography variant="caption" color="success.main">
                        Подтвержден
                      </Typography>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="age"
              control={control}
              rules={{
                min: { value: 13, message: "Возраст должен быть не менее 13" },
                max: { value: 120, message: "Возраст должен быть меньше 120" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Возраст"
                  variant="outlined"
                  type="number"
                  fullWidth
                  disabled={!isEditing}
                  className={styles.formField}
                  error={!!errors.age}
                  helperText={errors.age?.message}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              )}
            />
          </Box>

          {isEditing && (
            <Box className={styles.actionButtons}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                type="submit"
                disabled={!isDirty}
                className={styles.saveButton}
              >
                Сохранить изменения
              </Button>
            </Box>
          )}
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.formSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Интеграции
          </Typography>
          
          <Box className={styles.integrationContainer}>
            <Typography variant="body1" className={styles.integrationTitle}>
              Telegram
            </Typography>
            <LoginButton
              botUsername={'okacuki_bot'}
              authCallbackUrl={'https://akacuki.ru/app'}
              buttonSize="large"
              cornerRadius={8}
              showAvatar={true}
              lang="ru"
              onAuthCallback={handleTelegramAuth}
              requestAccess={'write'}
            />
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
};

export default ProfilePage;