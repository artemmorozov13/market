import { FC, useState, ReactNode, MouseEvent } from "react";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  ListItemButton
} from "@mui/material";
import {
  ShoppingCart,
  Store,
  List as ListIcon,
  Help,
  Share,
  Delete,
  Menu as MenuIcon,
  ShoppingBasket
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleShare = () => {
    const shareUrl = new URL("https://t.me/share/url");
    shareUrl.searchParams.set("url", "https://t.me/fricti_test_bot");
    shareUrl.searchParams.set("title", "Доставка фруктов и овощей");
    window.open(shareUrl.toString());
  };

  const navigationItems = [
    {
      path: RoutePath.products,
      icon: <Store className={styles.menuIcon} />,
      label: "Продукты"
    },
    {
      path: RoutePath.activeOrders,
      icon: <ListIcon className={styles.menuIcon} />,
      label: "Заказы"
    },
    {
      path: RoutePath.basket,
      icon: <ShoppingBasket className={styles.menuIcon} />,
      label: "Корзина",
      badge: totalProducts > 0 ? totalProducts : undefined
    },
    {
      path: RoutePath.help,
      icon: <Help className={styles.menuIcon} />,
      label: "Поддержка"
    }
  ];

  return (
    <div className={clsx(styles.root, className)}>
      {window?.Telegram?.WebApp?.initData && <InstallButton />}
      
      <Paper 
        component="nav"
        elevation={1}
        square
        className={styles.stickyHeader}
      >
        <Toolbar className={styles.toolbar}>
          <IconButton
            edge="start"
            className={styles.menuButton}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <div className={styles.actions}>
            {totalProducts > 0 && (
              <Typography variant="body1" className={styles.totalPrice}>
                {totalPrice} ₽
              </Typography>
            )}
            
            <Badge 
              badgeContent={totalProducts > 0 ? totalProducts : null} 
              className={styles.badge}
              color="primary"
            >
              <Button
                variant="contained"
                className={styles.cartButton}
                startIcon={<ShoppingCart />}
                onClick={() => navigate(RoutePath.basket)}
                disabled={totalProducts === 0}
              >
                Корзина
              </Button>
            </Badge>

            <IconButton className={styles.shareButton} onClick={handleShare}>
              <Share />
            </IconButton>
          </div>
        </Toolbar>
      </Paper>

      <main className={styles.content}>
        {children}
      </main>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        classes={{
          paper: styles.drawerPaper
        }}
      >
        <div className={styles.drawerContent}>
          <List className={styles.navList}>
            {navigationItems.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  className={clsx(styles.navItem, {
                    [styles.navItemActive]: location.pathname.startsWith(item.path)
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemIcon className={styles.navIcon}>
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        className={styles.navBadge}
                        color="primary"
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    classes={{ primary: styles.navText }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>

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