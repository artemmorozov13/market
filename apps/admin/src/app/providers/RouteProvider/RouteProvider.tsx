import { FC, Suspense, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { RouteType, routes } from "@shared/lib/routes/routes";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/consts/consts";
import Cookies from "js-cookie";
import { useUser } from "@entities/User";
import { Roles } from "@core/enums/role-enum";

export const RouteProvider: FC = observer(() => {
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const storeUser = useUser({
        enabled: !!Cookies.get(ACCESS_TOKEN) || !!Cookies.get(REFRESH_TOKEN)
    })

    const filteredRoutes = useMemo(() => {
        if (!Cookies.get(ACCESS_TOKEN) && !Cookies.get(REFRESH_TOKEN)) {
            const filteredRoutes = routes.filter(route => (
                route.roles.includes(Roles.NotAuthed)
            ))
            setIsMounted(true)
            return filteredRoutes
        }
        if (storeUser.data?.role) {
            const filteredRoutes = routes.filter((route) => {
                const token = Cookies.get(REFRESH_TOKEN)

                if (!token && route.authOnly) {
                    return false
                }
                if (token && route.notAuthOnly) {
                    return false
                }
                return route.roles.includes(storeUser.data.role)
            })
            setIsMounted(true)
            return filteredRoutes
        }
        return []
    }, [storeUser.data?.role])

    const renderRoute = (route: RouteType) => (
        <Route
            key={route.path}
            path={route.path}
            element={<Suspense>{route.element}</Suspense>}
        />
    );

    if (isMounted) {
        return (
            <Routes>
                {filteredRoutes.map(renderRoute)}
            </Routes>
        )
    }
    return null
});
