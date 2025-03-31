import { userStore } from "@entities/User";
import { REFRESH_TOKEN } from "@shared/lib/consts/consts";
import { routeConfig } from "@shared/lib/consts/routeConfig";
import { RouteType } from "@shared/lib/routes/routes";
import Cookies from "js-cookie";
import { FC, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
    route: RouteType;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, route }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.get(REFRESH_TOKEN)
        
        if (!token && route.authOnly) {
            navigate(routeConfig.login)
        }
        if (token && route.notAuthOnly) {
            navigate(routeConfig.product)
        }
    }, []);

    return <>{children}</>;
};
