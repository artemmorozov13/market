import { useFormContext } from 'react-hook-form'
import { Typography, Box, Button, Chip } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { LoginButton } from '@telegram-auth/react'
import styles from './IntegrationsForm.module.scss'
import { FC } from 'react'
import { StoreEditFormType } from '../../../types/storeEditTypes'
import { toast } from 'react-toastify'
import { API } from '@shared/api/instance'
import { useUser } from '@entities/User'

interface IntegrationsFormProps {}

export const IntegrationsForm: FC<IntegrationsFormProps> = () => {
  const { user } = useUser()
  const { watch } = useFormContext<StoreEditFormType>()

  const handleTestNotification = async () => {
    try {
      const response = await API.post('/telegram/test-message')
      toast(response.data.message, { type: 'success' })
    } catch (error) {
      console.error(error)
      toast('Ошибка отправки тестового сообщения', { type: 'error' })
    }
  }

  return (
    <section className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Интеграции
      </Typography>

      {user?.telegram_id ? (
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label="Подключен"
            color="success"
            size="small"
            icon={<CheckCircleOutlineIcon fontSize="small" />}
          />
          <Typography variant="body2" color="text.secondary">
            ID: {user.telegram_id}
          </Typography>
        </Box>
      ) : (
        <LoginButton
          botUsername={'okacuki_bot'}
          authCallbackUrl={'https://akacuki.ru/admin/shop/settings'}
          buttonSize="large"
          cornerRadius={8}
          showAvatar={true}
          lang="ru"
          requestAccess={'write'}
        />
      )}

      <Button
        variant="contained"
        color="secondary"
        onClick={handleTestNotification}
        disabled={!watch('telegramBotToken')}
        startIcon={<SendIcon />}
        fullWidth
        style={{ marginTop: '1.5rem' }}
      >
        Отправить тестовое сообщение
      </Button>
    </section>
  )
}
