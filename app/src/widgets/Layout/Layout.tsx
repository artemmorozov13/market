import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode, useState } from "react";
import { RoutePath } from "@/shared/routes/routeConfig";
import { ShoppingBasket, Storefront, ListAlt, HelpOutline } from "@mui/icons-material";
import ShareIcon from '@mui/icons-material/Share';
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
import { basketStore, postClearBasket } from "@/entities/Basket";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useNavigate } from "react-router";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from "./Layout.module.css";
import { clsx } from "yet-another-react-lightbox";
import { userStore } from "@/entities/User";

interface LayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = observer((props) => {
  const { children, ...otherProps } = props;
  const location = useLocation();

  const navigate = useNavigate();
  const { role } = userStore;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const { basketList, totalPrice, totalItems, clearBasket } = basketStore;
  const totalProducts = basketList.reduce((acc, product) => acc + product.quantity, 0);

  const getActiveTab = () => {
    if (location.pathname?.startsWith(RoutePath.basket)) return 2;
    if (location.pathname?.startsWith(RoutePath.activeOrders)) return 3;
    if (location.pathname?.startsWith(RoutePath.products)) return 1;
    if (location.pathname?.startsWith(RoutePath.help)) return 4;
    return 0;
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearBasket = async () => {
    if (role === 'customer') {
      await postClearBasket()
    }
    clearBasket()
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShare = () => {
    const shareOptions = {
      baseUrl: "https://t.me/share/url",
      params: {
        url: `https://t.me/fricti_test_bot`,
        title: "Доставка фруктов и овощей",
      }
    };
    const shareUrl = new URL(shareOptions.baseUrl);
    Object.entries(shareOptions.params).forEach(([key, value]) => {
      shareUrl.searchParams.set(key, value);
    });
    window.open(shareUrl.toString());
  }

  return (
    <div className={styles.container} {...otherProps}>
      <AppBar position="sticky" color="default" elevation={1} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Typography variant="h6" component="div" className={styles.title}>
            Фрукты
          </Typography>
          
          <div className={styles.basketControls}>
            {totalItems > 0 && (
              <Typography variant="body1" className={styles.basketTotal}>
                {totalPrice} ₽
              </Typography>
            )}
            
            <Badge 
              badgeContent={totalItems} 
              color="primary"
              className={styles.badge}
            >
              <Button
                variant="contained"
                className={styles.cartButton}
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate(RoutePath.basket)}
              >
                Корзина
              </Button>
            </Badge>
            
            {totalItems > 0 && (
              <>
                <IconButton 
                  aria-label="more"
                  onClick={handleMenuOpen}
                  className={styles.moreButton}
                >
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={open}
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
            <IconButton onClick={handleShare} color="primary">
              <ShareIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <div className={styles.content}>
        {children}
      </div>

      <Paper className={styles.bottomNav} elevation={3}>
        <BottomNavigation
          value={getActiveTab()}
          className={styles.bottomNavigation}
          showLabels
        >
          <BottomNavigationAction
            component={Link}
            to={RoutePath.products}
            className={styles.navItem}
            icon={<Storefront className={clsx(styles.menuImageIcon, styles.icon)} />}
            label="Продукты"
            value={1}
          />
          <BottomNavigationAction
            component={Link}
            to={RoutePath.activeOrders}
            className={styles.navItem}
            icon={<ListAlt className={clsx(styles.menuImageIcon, styles.icon)} />}
            label="Заказы"
            value={3}
          />
          <BottomNavigationAction
            component={Link}
            to={RoutePath.basket}
            className={styles.navItem}
            value={2}
            icon={
              <Badge 
                badgeContent={totalProducts || null} 
                color="error"
                overlap="circular"
                invisible={totalProducts === 0}
              >
                <ShoppingBasket className={clsx(styles.menuImageIcon, styles.icon)} />
              </Badge>
            }
            label="Корзина"
          />
          <BottomNavigationAction
            component={Link}
            to={RoutePath.help}
            className={styles.navItem}
            icon={<HelpOutline className={clsx(styles.menuImageIcon, styles.icon)} />}
            label="Поддержка"
            value={4}
          />
        </BottomNavigation>
      </Paper>
    </div>
  );
});