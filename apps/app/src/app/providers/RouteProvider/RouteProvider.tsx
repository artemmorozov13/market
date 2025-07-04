import { routeConfig } from "@/app/config/routeConfig";
import { FC, Suspense } from "react";
import { Route, Routes } from "react-router";

export const RouteProvider: FC = () => {
    return (
        <Routes>
            {Object.values(routeConfig).map(route => (
                <Route
                    path={route.path}
                    element={<Suspense>
                        <route.element/>
                    </Suspense>}
                />
            ))}
        </Routes>
    )
}