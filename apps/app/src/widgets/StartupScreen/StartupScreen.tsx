import { FC, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  Divider,
  Stack
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import { LoginButton, TelegramAuthData } from '@telegram-auth/react';
import { userStore, useTelegramAuth, useTelegramAuthData } from '@/entities/User';
import { Roles } from '@core/enums/role-enum';
import styles from './StartupScreen.module.scss';

const StartupScreen: FC = () => {
  const { initData } = useTelegramAuthData()
  const { authViaTelegram } = useTelegramAuth()

  const handleTelegramAuth = (user: TelegramAuthData) => {
    console.log(user)
    authViaTelegram(user)
  }

  const handleAnonimousAuth = () => {
    const { setUserRole } = userStore
    setUserRole(Roles.User)
  }

  useEffect(() => {
    if (initData) {
      authViaTelegram(initData)
    }
  }, [initData])
 
  return (
    <Box className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <TelegramIcon color="primary" className={styles.icon} />
        
        <Typography variant="h4" gutterBottom className={styles.title}>
          Добро пожаловать в наше приложение
        </Typography>
        
        <Alert severity="info" className={styles.alert}>
          Вы можете войти анонимно или авторизоваться через соцсети
        </Alert>
        
        <Stack spacing={2} className={styles.actions}>
          <Button 
            fullWidth
            variant="contained" 
            color="primary"
            className={styles.primaryButton}
            onClick={handleAnonimousAuth}
          >
            Продолжить без авторизации
          </Button>
          
          <Divider className={styles.divider}>или</Divider>
          
          <Typography variant="body1" className={styles.socialTitle}>
            Войти через соцсети
          </Typography>
          
          <Stack direction="row" spacing={2} className={styles.socialButtons}>
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
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default StartupScreen;
