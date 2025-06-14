import { AddProductPage } from "@pages/AddProductPage";
import { routeConfig } from "../consts/routeConfig";
import { UserRoleType } from "@entities/User";
import { ReactNode } from "react";
import { AuthPage } from "@pages/AuthPage";
import { AsortimentListPage } from "@pages/AsortimentListPage";
import { OrdersPage } from "@pages/OrderListPage";
import { HomePage } from "@pages/HomePage/HomePage";
import { NotFoundPage } from "@pages/NotFoundPage/NotFoundPage";
import { OrderTablePage } from "@pages/OrderTablePage";
import { PickPointPage } from "@pages/PickPointPage";
import { StatisticPage } from "@pages/StatisticPage";
import { TelegramBroadcastPage } from "@pages/TelegramBroadcastPage";
import { ShopSettingsPage } from "@pages/ShopSettingsPage";

export interface RouteType {
    roles: UserRoleType[],
    authOnly: boolean,
    notAuthOnly?: boolean,
    element: ReactNode,
    skipFilter?: boolean
    path: string
}

export const routes: RouteType[] = [
    {
        roles: [],
        authOnly: false,
        notAuthOnly: false,
        element: <HomePage/>,
        path: routeConfig["home"]
    },
    {
        roles: [],
        authOnly: true,
        element: <OrderTablePage/>,
        path: routeConfig["order-table"]
    },
    {
        roles: [],
        authOnly: true,
        element: <ShopSettingsPage/>,
        path: routeConfig["shop/settings"]
    },
    {
        roles: [],
        authOnly: true,
        element: <StatisticPage/>,
        path: routeConfig["statistic"]
    },
    {
        roles: [],
        authOnly: true,
        element: <TelegramBroadcastPage/>,
        path: routeConfig["telegram-broadcast"]
    },
    {
        roles: [],
        authOnly: false,
        notAuthOnly: true,
        element: <AuthPage/>,
        path: routeConfig["login"]
    },
    {
        roles: [],
        authOnly: true,
        element: <AddProductPage/>,
        path: routeConfig["product/create"]
    },
    {
        roles: [],
        authOnly: true,
        element: <AsortimentListPage/>,
        path: routeConfig["product"]
    },
    {
        roles: [],
        authOnly: true,
        element: <OrdersPage/>,
        path: routeConfig["orders"]
    },
    {
        roles: [],
        authOnly: true,
        element: <PickPointPage/>,
        path: routeConfig["pickup-points"]
    },
    {
        roles: [],
        authOnly: false,
        notAuthOnly: false,
        element: <NotFoundPage/>,
        path: "*",
    }
]