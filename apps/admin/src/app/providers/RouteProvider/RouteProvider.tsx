import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { RouteType, routes } from "@shared/lib/routes/routes";
import { ProtectedRoute } from "../ProtectedRouteProvider/ui/ProtectedRoute";
import { REFRESH_TOKEN } from "@shared/lib/consts/consts";
import Cookies from "js-cookie";

export const RouteProvider: FC = observer(() => {
    const filteredRoutes = routes.filter((route) => {
        const token = Cookies.get(REFRESH_TOKEN)

        if (!token && route.authOnly) {
            return false
        }
        if (token && route.notAuthOnly) {
            return false
        }
        return true
    })

    const renderRoute = (route: RouteType) => (
        <Route
            key={route.path}
            path={route.path}
            element={
                <ProtectedRoute route={route}>
                    {route.element}
                </ProtectedRoute>
            }
        />
    );
    return <Routes>{filteredRoutes.map(renderRoute)}</Routes>;
});
