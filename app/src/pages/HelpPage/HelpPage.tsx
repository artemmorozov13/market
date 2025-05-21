import { FC } from 'react';
import styles from './HelpPage.module.scss';
import { Layout } from '@/widgets/Layout';
import { observer } from 'mobx-react-lite';
import { Container } from '@/shared/ui/Container';
import { 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TelegramIcon from '@mui/icons-material/Telegram';

const faqs = [
    {
        question: "Как работает доставка?",
        answer: "Курьер привезёт ваш заказ по указанному адресу, к парадной. Перед доставкой он свяжется с вами для подтверждения. Стоимость доставки — 100 рублей."
    },
    {
        question: "По каким дням осуществляется доставка?",
        answer: "Дни доставки зависят от района. При оформлении заказа мы автоматически определяем ваш район и предлагаем доступные дни и временные интервалы."
    },
    {
        question: "Когда можно сделать заказ?",
        answer: "Информация о новых товарах публикуется в Telegram-группах, а также рассылается пользователям этого приложения. Заказ можно изменить или отменить не позднее чем за час до начала дня доставки (до 22:59 предыдущего дня)."
    },
    {
        question: "Можно ли отменить или изменить заказ?",
        answer: "Да, вы можете полностью отменить заказ или изменить его состав в разделе «Заказы»."
    }
];

const TELEGRAM_CHAT_URL = "https://t.me/leninskiyprospekt_fruit_express";

const HelpPage: FC = observer(() => {
    return (
      <Layout className={styles.wrapper}>
        <Container className={styles.container}>
          <div className={styles.header}>
            <Typography variant="h4" className={styles.title}>
                Помощь с заказом
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              Мы всегда готовы помочь вам с любыми вопросами
            </Typography>
          </div>
          
          <div className={styles.telegramSection}>
            <div className={styles.telegramContent}>
              <TelegramIcon className={styles.telegramIcon} />
              <Typography variant="h5" className={styles.telegramTitle}>
                Напишите нам в Telegram
              </Typography>
              <Typography variant="body1" className={styles.telegramText}>
                Наша команда поддержки ответит вам в течение 15 минут
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={styles.button}
                startIcon={<TelegramIcon />}
                href={TELEGRAM_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Перейти в Telegram-чат
              </Button>
            </div>
          </div>
          
          <Divider className={styles.divider} />
          
          <div className={styles.faqSection}>
            <Typography variant="h5" className={styles.faqTitle}>
              Часто задаваемые вопросы
            </Typography>
            
            <div className={styles.accordions}>
              {faqs.map((faq, index) => (
                <Accordion key={index} className={styles.accordion}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Typography className={styles.accordionQuestion}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography className={styles.accordionAnswer}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </div>
        </Container>
      </Layout>
    );
});

export default HelpPage;