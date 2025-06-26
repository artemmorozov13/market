import { FC, useState, useMemo, ReactNode, MouseEvent } from "react";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";
import {
  ShoppingBasket,
  Storefront,
  ListAlt,
  HelpOutline,
  Share as ShareIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material";

import { RoutePath } from "@/shared/routes/routeConfig";
import { userStore } from "@/entities/User";
import { InstallButton } from "@/shared/ui/InstallButton";
import { Roles } from "@core/enums/role-enum";
import { useBasket, useClearBasket } from "@/entities/Basket";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

interface NavigationItem {
  path: string;
  icon: ReactNode;
  label: string;
  badgeContent?: number;
}

export const Layout: FC<LayoutProps> = observer(({ children, className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = userStore;
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { clearBasket } = useClearBasket();
  const { summary } = useBasket();
  
  const totalProducts = summary?.totalItems || 0;
  const totalPrice = summary?.totalPrice || 0;
  const isMenuOpen = Boolean(menuAnchor);

  const activeTab = useMemo(() => {
    if (location.pathname?.startsWith(RoutePath.products)) return 0;
    if (location.pathname?.startsWith(RoutePath.basket)) return 2;
    if (location.pathname?.startsWith(RoutePath.activeOrders)) return 1;
    if (location.pathname?.startsWith(RoutePath.help)) return 3;
    return 0;
  }, [location.pathname]);

  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      path: RoutePath.products,
      icon: <Storefront className={clsx(styles.menuImageIcon, styles.icon)} />,
      label: "Продукты"
    },
    {
      path: RoutePath.activeOrders,
      icon: <ListAlt className={clsx(styles.menuImageIcon, styles.icon)} />,
      label: "Заказы"
    },
    {
      path: RoutePath.basket,
      icon: (
        <Badge 
          badgeContent={totalProducts > 0 ? totalProducts : null} 
          color="error"
          overlap="circular"
        >
          <ShoppingBasket className={clsx(styles.menuImageIcon, styles.icon)} />
        </Badge>
      ),
      label: "Корзина"
    },
    {
      path: RoutePath.help,
      icon: <HelpOutline className={clsx(styles.menuImageIcon, styles.icon)} />,
      label: "Поддержка"
    }
  ], [totalProducts]);

  const handleMenuClose = () => setMenuAnchor(null);
  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
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

  return (
    <div className={clsx(styles.container, className)}>
      {window?.Telegram?.WebApp?.initData && <InstallButton />}
      
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1} 
        className={styles.appBar}
      >
        <Toolbar className={styles.toolbar}>
          <Typography variant="h6" component="div" className={styles.title}>
            {/* Магазины */}
          </Typography>
          
          <div className={styles.basketControls}>
            {totalProducts > 0 && (
              <Typography variant="body1" className={styles.basketTotal}>
                {totalPrice.toFixed(2)} ₽
              </Typography>
            )}
            
            <Badge 
              badgeContent={totalProducts > 0 ? totalProducts : null} 
              color="primary"
              className={styles.badge}
            >
              <Button
                variant="contained"
                className={styles.cartButton}
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate(RoutePath.basket)}
                disabled={totalProducts === 0}
              >
                Корзина
              </Button>
            </Badge>
            
            {totalProducts > 0 && (
              <>
                <IconButton 
                  aria-label="Дополнительные действия с корзиной"
                  onClick={handleMenuOpen}
                  className={styles.moreButton}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={menuAnchor}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  className={styles.menu}
                >
                  <MenuItem
                    onClick={handleClearBasket}
                    className={styles.menuItem}
                  >
                    <DeleteIcon className={styles.menuIcon} />
                    Очистить корзину
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={() => navigate(RoutePath.basket)}
                    className={styles.menuItem}
                  >
                    <ArrowForwardIcon className={styles.menuIcon} />
                    Перейти в корзину
                  </MenuItem>
                </Menu>
              </>
            )}
            
            <IconButton 
              onClick={handleShare} 
              color="primary"
              aria-label="Поделиться приложением"
            >
              <ShareIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <main className={styles.content}>
        {children}
      </main>

      <Paper 
        component="nav" 
        className={styles.bottomNav} 
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigation
          value={activeTab}
          className={styles.bottomNavigation}
          showLabels
        >
          {navigationItems.map((item, index) => (
            <BottomNavigationAction
              key={index}
              component={Link}
              to={item.path}
              className={styles.navItem}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </div>
  );
});