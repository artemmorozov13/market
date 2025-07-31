import { FC, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  Divider,
  Stack,
  LinearProgress
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import { LoginButton, TelegramAuthData } from '@telegram-auth/react';
import { useCreateUser, userStore, useTelegramAuth, useTelegramAuthData } from '@/entities/User';
import { Roles } from '@core/enums/role-enum';
import styles from './StartupScreen.module.scss';
import { RoutePath } from '@/shared/routes/routeConfig';

const StartupScreen: FC = () => {
  const { initData } = useTelegramAuthData();
  const { createAnonimousUser, isPending: isAnonPending } = useCreateUser();
  const { authViaTelegram, isPending: isTelegramPending } = useTelegramAuth();

  const isLoading = isAnonPending || isTelegramPending;

  const handleTelegramAuth = async (user: TelegramAuthData) => {
    await authViaTelegram(user);
    window.location.replace(RoutePath.stores);
  };

  const handleAnonimousAuth = async () => {
    const { setUserRole } = userStore;
    setUserRole(Roles.User);
    await createAnonimousUser();
    window.location.replace(RoutePath.stores);
  };

  useEffect(() => {
    if (initData) {
      authViaTelegram(initData);
      window.location.replace(RoutePath.stores);
    }
  }, [initData]);
 
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

        {/* Добавляем LinearProgress, который показывается при загрузке */}
        {isLoading && <LinearProgress sx={{ marginBottom: 2 }} />}
        
        <Stack spacing={2} className={styles.actions}>
          <Button 
            fullWidth
            variant="contained" 
            color="primary"
            className={styles.primaryButton}
            onClick={handleAnonimousAuth}
            disabled={isLoading} // Блокируем кнопку во время загрузки
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