import { REFRESH_TOKEN } from "@shared/lib/consts/consts";
import { routeConfig } from "@shared/lib/consts/routeConfig";
import Cookies from "js-cookie";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const HomePage: FC = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.get(REFRESH_TOKEN)
        
        if (!token) {
            navigate(routeConfig.login)
        }
        if (token) {
            navigate(routeConfig.product)
        }
    }, []);

    return (
        <></>
    )
}
