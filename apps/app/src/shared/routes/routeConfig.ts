export enum AppRoutes {
  Stores = 'stores',
  StoreById = 'storeById',
  Home = 'home',
  Profile = 'profile',
  Order = 'order',
  ActiveOrders = 'activeOrders',
  Basket = 'basket',
  Help = 'help',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.Stores]: '/app/stores/',
  [AppRoutes.StoreById]: '/app/store/:storeId',
  [AppRoutes.Home]: '/app/',
  [AppRoutes.Profile]: '/app/profile',
  [AppRoutes.Order]: '/app/order',
  [AppRoutes.ActiveOrders]: '/app/orders',
  [AppRoutes.Basket]: '/app/basket',
  [AppRoutes.Help]: '/app/help',
}
