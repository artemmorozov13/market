import { routeConfig } from '../consts/routeConfig'
import { ReactNode } from 'react'
import { AuthPage } from '@pages/SharedPages/AuthPage'
import { AsortimentListPage } from '@pages/AdminPages/AsortimentListPage'
import { OrdersPage } from '@pages/AdminPages/OrderListPage'
import { HomePage } from '@pages/SharedPages/HomePage/HomePage'
import { NotFoundPage } from '@pages/SharedPages/NotFoundPage/NotFoundPage'
import { OrderTablePage } from '@pages/AdminPages/OrderTablePage'
import { PickPointPage } from '@pages/AdminPages/PickPointPage'
import { StatisticPage } from '@pages/AdminPages/StatisticPage'
import { TelegramBroadcastPage } from '@pages/AdminPages/TelegramBroadcastPage'
import { ShopSettingsPage } from '@pages/AdminPages/ShopSettingsPage'
import { SuppliersPage } from '@pages/AdminPages/SuppliersPage'
import { Roles } from '@core/enums/role-enum'
import { OfferProductPage, OrderedProductsPage, StatisticSupplierPage } from '@pages/SupplierPages'
import { AddProductPage } from '@pages/AdminPages/AddProductPage'
import { DeliveryAreasPage } from '@pages/AdminPages/DeliveryAreasPage'

export interface RouteType {
  roles: Roles[]
  authOnly: boolean
  notAuthOnly?: boolean
  element: ReactNode
  skipFilter?: boolean
  path: string
}

export const routes: RouteType[] = [
  {
    roles: [Roles.Admin, Roles.Vendor, Roles.NotAuthed],
    authOnly: false,
    notAuthOnly: false,
    element: <HomePage />,
    path: routeConfig['home'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <OrderTablePage />,
    path: routeConfig['order-table'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <ShopSettingsPage />,
    path: routeConfig['shop/settings'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <SuppliersPage />,
    path: routeConfig['suppliers'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <StatisticPage />,
    path: routeConfig['statistic'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <TelegramBroadcastPage />,
    path: routeConfig['telegram-broadcast'],
  },
  {
    roles: [Roles.NotAuthed],
    authOnly: false,
    notAuthOnly: true,
    element: <AuthPage />,
    path: routeConfig['login'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <AddProductPage />,
    path: routeConfig['product/create'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <AsortimentListPage />,
    path: routeConfig['product'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <OrdersPage />,
    path: routeConfig['orders'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <PickPointPage />,
    path: routeConfig['pickup-points'],
  },
  {
    roles: [Roles.Admin],
    authOnly: true,
    element: <DeliveryAreasPage />,
    path: routeConfig['delivery-areas'],
  },

  // Supplier pages
  {
    roles: [Roles.Vendor],
    authOnly: true,
    element: <OrderedProductsPage />,
    path: routeConfig['supplier-orders'],
  },
  {
    roles: [Roles.Vendor],
    authOnly: true,
    element: <OfferProductPage />,
    path: routeConfig['supplier-products'],
  },
  {
    roles: [Roles.Vendor],
    authOnly: true,
    element: <StatisticSupplierPage />,
    path: routeConfig['supplier-statistic'],
  },

  // Not found page
  {
    roles: [Roles.Admin, Roles.NotAuthed, Roles.Vendor],
    authOnly: false,
    notAuthOnly: false,
    element: <NotFoundPage />,
    path: '*',
  },
]
