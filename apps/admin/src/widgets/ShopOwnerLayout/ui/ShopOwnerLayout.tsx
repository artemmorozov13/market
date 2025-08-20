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
import { Button, Skeleton, IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styles from "./ShopOwnerLayout.module.scss"
import { routeConfig } from "../../../shared/lib/consts/routeConfig";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../shared/lib/consts/consts";

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
    People as SuppliersIcon
} from '@mui/icons-material';
import { useUser } from "@entities/User";
import { Roles } from "@core/enums/role-enum";
import { bottomMenu, menuListTop, middleMenu } from "../lib/sidebarList";
import { SidebarListEnum } from "../types/sidebarListEnum";

interface ShopOwnerLayoutProps {
    children: ReactNode
}

export const ShopOwnerLayout: FC<ShopOwnerLayoutProps> = observer((props) => {
    const { children } = props

    const [mobileOpen, setMobileOpen] = useState<boolean>(false)
    const { user, isLoading } = useUser()

    const drawerWidth = 240;

    const handleLogout = () => {
        Cookies.remove(ACCESS_TOKEN)
        Cookies.remove(REFRESH_TOKEN)
        window.location.replace(routeConfig["login"])
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const menuListFilter = (item: any) => {
        const isShopWorkWithSuppliers = !!user?.store?.isWorkWithPartners
        if (item.name === SidebarListEnum.Suppliers && !isShopWorkWithSuppliers) {
            return false
        }
        return (
            item.roles.includes(user?.role)
        )
    }

    const drawer = () => {
        if (user?.role) {
            return (
                <div>
                    <Toolbar />
                    <Divider />
                    <List>
                        {menuListTop.filter(menuListFilter).map((menuItem) => (
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
                        {middleMenu.filter(menuListFilter).map((menuItem) => (
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
                        {bottomMenu.filter(menuListFilter).map((menuItem) => (
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
        }
        return null
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isLoading ? (
                            <Skeleton height={40} width={150} />
                        ) : (
                            <Typography variant="h6" noWrap>
                                {user?.store?.name}
                            </Typography>
                        )}
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
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer()}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer()}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
})