import { FC, ReactNode, useState, useEffect } from "react"
import { CircularProgress, Box, Typography } from "@mui/material"
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from "./AuthProvider.module.scss"
import 'react-toastify/dist/ReactToastify.css'
import clsx from "clsx"
import { userStore } from "@/entities/User"
import { LoginButton, TelegramAuthData } from '@telegram-auth/react';
import { InstallButton } from "@/shared/ui/InstallButton";
import { useUser } from "../api/fetchUserData";

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [initData, setInitData] = useState<TelegramAuthData | null>(null)
  const user = useUser({ initData })
  const { role } = userStore

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      const data = {
        id: urlParams.get('id'),
        first_name: urlParams.get('first_name'),
        last_name: urlParams.get('last_name'),
        username: urlParams.get('username'),
        photo_url: urlParams.get('photo_url'),
        auth_date: urlParams.get('auth_date'),
        hash: urlParams.get('hash')
      } as any;
      
      setInitData(data);      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTelegramAuth = (data: any) => {
    const authData: TelegramAuthData = {
      id: data.id.toString(),
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      photo_url: data.photo_url,
      auth_date: data.auth_date.toString(),
      hash: data.hash
    };
    setInitData(authData);
  }

  if (user.isLoading) {
    return (
      <div className={styles.wrapper}>
        <CircularProgress/>
      </div>
    )
  }

  if (role === "notAuthed") {
    return (
      <Box className={styles.authContainer}>
        <Box className={styles.authCard}>
          <LockOutlinedIcon className={styles.authIcon} color="primary" />
          <Typography variant="h5" className={styles.authTitle}>
            Требуется авторизация
          </Typography>
          <Typography variant="body2" className={styles.authDescription}>
            Для доступа к оформлению заказа войдите через Telegram
          </Typography>
          <Box className={clsx(styles.authButtonContainer, styles.telegramButtonWrapper)}>
            <LoginButton
              botUsername={'fricti_test_bot'}
              authCallbackUrl={'https://fruvost.ru/app'}
              buttonSize="large"
              cornerRadius={8}
              showAvatar={true}
              lang="ru"
              onAuthCallback={handleTelegramAuth}
              requestAccess={'write'}
            />
          </Box>
        </Box>
        {!window?.Telegram?.WebApp?.initData && <InstallButton/>}
      </Box>
    )
  }

  return children
}

export default AuthProvider