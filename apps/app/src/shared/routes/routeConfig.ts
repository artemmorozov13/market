export enum AppRoutes {
    Home = 'home',
    Profile = 'profile',
    Order = 'order',
    ActiveOrders = 'activeOrders',
    Basket = 'basket',
    Products = 'products',
    Help = 'help'
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.Home]: "/app/",
    [AppRoutes.Profile]: "/app/profile",
    [AppRoutes.Order]: "/app/order",
    [AppRoutes.ActiveOrders]: "/app/orders",
    [AppRoutes.Basket]: "/app/basket",
    [AppRoutes.Products]: "/app/products",
    [AppRoutes.Help]: '/app/help'
}