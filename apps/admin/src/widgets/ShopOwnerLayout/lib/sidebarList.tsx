import { Roles } from "@core/enums/role-enum"
import { routeConfig } from "@shared/lib/consts/routeConfig"
import {
    Storefront as StorefrontIcon,
    ListAlt as ListAltIcon,
    ShoppingCart as ShoppingCartIcon,
    Add as AddIcon,
    LocalShipping as DeliveryIcon,
    Assessment as StatsIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    PointOfSale as PointOfSaleIcon,
    Inventory as InventoryIcon,
    People as SuppliersIcon,
} from '@mui/icons-material';
import TelegramIcon from '@mui/icons-material/Telegram';
import SettingsIcon from '@mui/icons-material/Settings';
import { LocationOn as DeliveryAreasIcon,} from '@mui/icons-material';
import { SidebarListEnum } from "../types/sidebarListEnum";



export const menuListTop = [
    {
        label: "Статистика",
        href: routeConfig['statistic'],
        icon: <StatsIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.Statistic
    },
    {
        label: "Статистика",
        href: routeConfig['supplier-statistic'],
        icon: <StatsIcon />,
        roles: [Roles.Vendor],
        visibility: true,
        name: SidebarListEnum.SupplierStatistic
    },
]

export const middleMenu = [
    {
        label: "Таблица заказов",
        href: routeConfig["order-table"],
        icon: <PointOfSaleIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.OrderTable
    },
    {
        label: "Список товаров",
        href: routeConfig["product"],
        icon: <InventoryIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.OrderList
    },
    {
        label: "Районы доставки",
        href: routeConfig["delivery-areas"],
        icon: <DeliveryIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.DeliveryDistrict
    },
    {
        label: "Пункты выдачи",
        href: routeConfig["pickup-points"],
        icon: <DeliveryAreasIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.PickupPoint
    },
    {
        label: "Поставщики",
        href: routeConfig["suppliers"],
        icon: <SuppliersIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.Suppliers,
    },
    {
        label: "Таблица заказов",
        href: routeConfig['supplier-orders'],
        icon: <PointOfSaleIcon />,
        roles: [Roles.Vendor],
        visibility: true,
        name: SidebarListEnum.SupplierOrderTable
    },
]

export const bottomMenu = [
    {
        label: "Добавить товар",
        href: routeConfig["product/create"],
        icon: <AddIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.CreateProduct
    },
    {
        label: "Создать телеграм рассылку",
        href: routeConfig["telegram-broadcast"],
        icon: <TelegramIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.CreateTelegramBroadcast
    },
    {
        label: "Настройки",
        href: routeConfig["shop/settings"],
        icon: <SettingsIcon />,
        roles: [Roles.Admin],
        visibility: true,
        name: SidebarListEnum.ShopSettings
    },
    {
        label: "Товары",
        href: routeConfig['supplier-products'],
        icon: <InventoryIcon />,
        roles: [Roles.Vendor],
        visibility: true,
        name: SidebarListEnum.SupplierProducts
    },
]