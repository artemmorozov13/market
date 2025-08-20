import { useState } from 'react';
import {
  Typography,
  Box,
  Button
} from '@mui/material';
import { CheckCircleOutline, FileCopyOutlined } from '@mui/icons-material';
import clsx from 'clsx'
import styles from './LinksForm.module.scss';
import { FC } from 'react';
import { useUser } from '@entities/User';

interface LinksFormProps {

}

export const LinksForm: FC<LinksFormProps> = () => {
  const { user } = useUser()
  const [isCopiedTelegram, setIsCopiedTelegram] = useState(false);
  const [isCopiedBrowser, setIsCopiedBrowser] = useState(false);

  const handleCopyMiniAppUrl = () => {
    navigator.clipboard.writeText(`https://t.me/okacuki_bot/?startapp=shop_${user?.store?.id}`);
    setIsCopiedTelegram(true);
    setTimeout(() => setIsCopiedTelegram(false), 2000);
  };

  const handleCopyBrowserLink = () => {
    navigator.clipboard.writeText(`https://akacuki.ru/app/?store=${user?.store?.id}`);
    setIsCopiedBrowser(true);
    setTimeout(() => setIsCopiedBrowser(false), 2000);
  };

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Ссылки для клиентов
      </Typography>

      <div className={styles.buttonGroup}>
        <Button
          onClick={handleCopyMiniAppUrl}
          className={clsx(styles.copyButton, { [styles.copied]: isCopiedTelegram })}
          startIcon={isCopiedTelegram ? <CheckCircleOutline /> : <FileCopyOutlined />}
          variant="contained"
          color="primary"
          fullWidth
        >
          {isCopiedTelegram ? "Скопировано!" : "Скопировать ссылку для Telegram Mini App"}
        </Button>
        <Button
          onClick={handleCopyBrowserLink}
          className={clsx(styles.copyButton, { [styles.copied]: isCopiedBrowser })}
          startIcon={isCopiedBrowser ? <CheckCircleOutline /> : <FileCopyOutlined />}
          variant="contained"
          color="primary"
          fullWidth
        >
          {isCopiedBrowser ? "Скопировано!" : "Скопировать ссылку для браузера"}
        </Button>
      </div>
    </section>
  );
};