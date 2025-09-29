import { Roles } from "@core/enums/role-enum";
import { useUser } from "@entities/User";
import { REFRESH_TOKEN } from "@shared/lib/consts/consts";
import { routeConfig } from "@shared/lib/consts/routeConfig";
import Cookies from "js-cookie";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const HomePage: FC = () => {
    const { user } = useUser()
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = Cookies.get(REFRESH_TOKEN)
        
        if (!token) {
            navigate(routeConfig.login)
        }
        if (token && user?.role === Roles.Admin) {
            navigate(routeConfig.product)
        }
        if (token && user?.role === Roles.Vendor) {
            navigate(routeConfig["supplier-products"])
        }
    }, []);

    return (
        <></>
    )
}
