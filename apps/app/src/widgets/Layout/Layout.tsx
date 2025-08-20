import { FC, useState, ReactNode, MouseEvent } from "react";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { clsx } from "clsx";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  ListItemIcon
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  List as ListIcon,
  Help,
  Share,
  Delete,
  Menu as MenuIcon,
  ShoppingBasket,
  AccountCircle
} from "@mui/icons-material";

import { RoutePath } from "@/shared/routes/routeConfig";
import { userStore } from "@/entities/User";
import { InstallButton } from "@/shared/ui/InstallButton";
import { Roles } from "@core/enums/role-enum";
import { useBasket, useClearBasket } from "@/entities/Basket";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout: FC<LayoutProps> = observer(({ children, className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = userStore;
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { clearBasket } = useClearBasket();
  const { summary } = useBasket();
  
  const totalProducts = summary?.totalItems || 0;
  const totalPrice = summary?.totalPrice || 0;
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClearBasket = async () => {
    if (role === Roles.User) {
      await clearBasket();
    }
    handleMenuClose();
  };

  const navigationItems = [
    {
      path: RoutePath.stores,
      icon: <Store />,
      label: "Магазины"
    },
    {
      path: RoutePath.activeOrders,
      icon: <ListIcon />,
      label: "Заказы"
    },
    {
      path: RoutePath.basket,
      icon: (
        <Badge badgeContent={totalProducts > 0 ? totalProducts : null} color="primary">
          <ShoppingBasket />
        </Badge>
      ),
      label: "Корзина"
    },
    // {
    //   path: RoutePath.help,
    //   icon: <Help />,
    //   label: "Поддержка"
    // },
    {
      path: RoutePath.profile,  // Предполагается, что RoutePath.profile уже определен
      icon: <AccountCircle />,  // Импортируйте из MUI: import { AccountCircle } from '@mui/icons-material'
      label: "Профиль"
    }
  ];

  return (
    <div className={clsx(styles.root, className)}>
      {window?.Telegram?.WebApp?.initData && <InstallButton />}

      <main className={styles.content}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <Paper className={styles.bottomNavigation}>
        <BottomNavigation
          showLabels
          value={navigationItems.findIndex(item => location.pathname.startsWith(item.path))}
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              icon={item.icon}
              className={clsx(styles.navItem, {
                [styles.navItemActive]: location.pathname.startsWith(item.path)
              })}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        classes={{
          paper: styles.menuPaper,
          list: styles.menuList
        }}
      >
        <MenuItem 
          onClick={handleClearBasket}
          className={styles.menuItem}
        >
          <ListItemIcon className={styles.menuIcon}>
            <Delete fontSize="small" />
          </ListItemIcon>
          <span className={styles.menuText}>Очистить корзину</span>
        </MenuItem>
        <Divider className={styles.divider} />
        <MenuItem 
          onClick={() => navigate(RoutePath.basket)}
          className={styles.menuItem}
        >
          <ListItemIcon className={styles.menuIcon}>
            <ShoppingBasket fontSize="small" />
          </ListItemIcon>
          <span className={styles.menuText}>Перейти в корзину</span>
        </MenuItem>
      </Menu>
    </div>
  );
});
