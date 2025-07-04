import { FC } from 'react';
import styles from './NoTelegramWarning.module.scss';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert 
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

const NoTelegramWarning: FC = () => {
  return (
    <Box className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <TelegramIcon color="primary" className={styles.icon} />
        
        <Typography variant="h4" gutterBottom className={styles.title}>
          Это Telegram мини-приложение
        </Typography>
        
        <Alert severity="warning" className={styles.alert}>
          Для корректной работы откройте это приложение через Telegram
        </Alert>
        
        <Typography variant="body1" className={styles.description}>
          Вы пытаетесь получить доступ к приложению через браузер. 
          Это приложение предназначено для использования только внутри Telegram.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          href="https://t.me" 
          target="_blank"
          className={styles.button}
          startIcon={<TelegramIcon />}
        >
          Открыть в Telegram
        </Button>
      </Paper>
    </Box>
  );
};

export default NoTelegramWarning;