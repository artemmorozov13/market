import { FC, ReactNode, useState } from "react"
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { storeStorage } from "../../entities/Store";
import { Button, Skeleton, IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styles from "./ShopOwnerLayout.module.scss"
import { routeConfig } from "../../shared/lib/consts/routeConfig";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../shared/lib/consts/consts";

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
    Inventory as InventoryIcon
  } from '@mui/icons-material';
  


interface ShopOwnerLayoutProps {
    children: ReactNode
}

export const ShopOwnerLayout: FC<ShopOwnerLayoutProps> = observer((props) => {
    const { children } = props

    const [mobileOpen, setMobileOpen] = useState<boolean>(false)
    const { store } = storeStorage

    const drawerWidth = 240;

    const menuListTop = [
        {
          label: "Статистика",
          href: routeConfig['statistic'],
          icon: <StatsIcon />
        },
    ]

    const middleMenu = [
        {
            label: "Таблица заказов",
            href: routeConfig["order-table"],
            icon: <PointOfSaleIcon />
        },
        // {
        //     label: "Список заказов",
        //     href: routeConfig["orders"],
        //     icon: <ShoppingCartIcon />
        // },
        {
            label: "Список товаров",
            href: routeConfig["product"],
            icon: <InventoryIcon />
        },
        {
            label: "Пункты выдачи",
            href: routeConfig["pickup-points"],
            icon: <DeliveryIcon />
        }
    ]

    const bottomMenu = [
        {
            label: "Добавить товар",
            href: routeConfig["product/create"],
            icon: <AddIcon />
        }
    ]

    const handleLogout = () => {
        Cookies.remove(ACCESS_TOKEN)
        Cookies.remove(REFRESH_TOKEN)
        window.location.replace(routeConfig["login"])
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {menuListTop.map((menuItem) => (
                    <Link key={menuItem.href} to={menuItem.href} className={styles.link}>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {menuItem.icon}
                                </ListItemIcon>
                                <ListItemText primary={menuItem.label} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider />
            <List>
                {middleMenu.map((menuItem) => (
                    <Link key={menuItem.href} to={menuItem.href} className={styles.link}>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {menuItem.icon}
                                </ListItemIcon>
                                <ListItemText primary={menuItem.label} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider />
            <List>
                {bottomMenu.map((menuItem) => (
                    <Link key={menuItem.href} to={menuItem.href} className={styles.link}>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {menuItem.icon}
                                </ListItemIcon>
                                <ListItemText primary={menuItem.label} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider />
        </div>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` }, // Изменено с sm на md
                    ml: { md: `${drawerWidth}px` }, // Изменено с sm на md
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }} // Изменено с sm на md
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {store?.case({
                            pending: () => <Skeleton height={40} width={150} />,
                            fulfilled: (storeData) => (
                                <Typography variant="h6" noWrap>
                                    {storeData.name}
                                </Typography>
                            ),
                        })}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} // Изменено с sm на md
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' }, // Изменено с sm на md
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' }, // Изменено с sm на md
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }} // Изменено с sm на md
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
})