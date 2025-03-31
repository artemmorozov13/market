import { FC } from "react";
import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "@shared/lib/consts/consts";
import { ShopOwnerLayout } from "@widgets/ShopOwnerLayout";
import Cookies from "js-cookie";
import styles from "./NotFoundPage.module.scss";
import { routeConfig } from "@shared/lib/consts/routeConfig";

export const NotFoundPage: FC = () => {
    const token = Cookies.get(ACCESS_TOKEN);
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(routeConfig.home);
    };

    const content = (
        <div className={styles.notFoundContainer}>
            <Typography variant="h1" className={styles.title}>
                404
            </Typography>
            <Typography variant="h4" className={styles.subtitle}>
                Страница не найдена
            </Typography>
            <Typography variant="body1" className={styles.description}>
                Извините, мы не смогли найти страницу, которую вы ищете.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                className={styles.homeButton}
                onClick={handleGoHome}
            >
                Вернуться на главную
            </Button>
        </div>
    );

    return token ? <ShopOwnerLayout>{content}</ShopOwnerLayout> : content;
};