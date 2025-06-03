import { useState, useEffect, FC } from 'react';
import { 
  Button,
  Paper,
  Typography,
  IconButton,
  Modal
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import styles from "./InstallButton.module.scss";

export const InstallButton: FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setIsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isInstallable) return null;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      className={styles.modal}
    >
      <Paper className={styles.paper}>
        <div className={styles.header}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        
        <div className={styles.content}>
          <Typography variant="h6" gutterBottom>
            Установить приложение
          </Typography>
          <Typography variant="body1">
            Для более удобного использования установите наше приложение
          </Typography>
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            fullWidth
          >
            Позже
          </Button>
          <Button 
            variant="contained" 
            onClick={handleInstallClick}
            fullWidth
          >
            Установить
          </Button>
        </div>
      </Paper>
    </Modal>
  );
};