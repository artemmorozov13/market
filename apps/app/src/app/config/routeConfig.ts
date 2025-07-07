import { FC, LazyExoticComponent } from "react";
import { AppRoutes, RoutePath } from "@/shared/routes/routeConfig";
import { Roles } from "@core/enums/role-enum";
import { ActiveOrderPage } from "@/pages/ActiveOrderPage";
import { BasketPage } from "@/pages/BasketPage";
import { HelpPage } from "@/pages/HelpPage";
import { OrderPage } from "@/pages/OrderPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { StoreListPage } from "@/pages/StoreListPage";

export interface AppRoutesWithProps {
    roles: Roles[],
    authOnly: boolean,
    element: FC,
    path: string
}

export const routeConfig: Record<AppRoutes, AppRoutesWithProps> = {
    [AppRoutes.Stores]: {
        path: RoutePath.stores,
        element: StoreListPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.StoreById]: {
        path: RoutePath.storeById,
        element: ProductsPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.ActiveOrders]: {
        path: RoutePath.activeOrders,
        element: ActiveOrderPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.Basket]: {
        path: RoutePath.basket,
        element: BasketPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.Help]: {
        path: RoutePath.help,
        element: HelpPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.Home]: {
        path: RoutePath.home,
        element: StoreListPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.Order]: {
        path: RoutePath.order,
        element: OrderPage,
        authOnly: true,
        roles: [Roles.User]
    },
    [AppRoutes.Profile]: {
        path: RoutePath.profile,
        element: ProfilePage,
        authOnly: true,
        roles: [Roles.User]
    }
}