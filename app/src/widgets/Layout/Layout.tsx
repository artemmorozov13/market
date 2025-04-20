import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode } from "react";
import { RoutePath } from "@/shared/routes/routeConfig";
import { ShoppingBasket, Storefront, ListAlt } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Paper, Badge } from "@mui/material";
import { basketStore } from "@/entities/Basket";
import { observer } from "mobx-react-lite";
import { Link, useLocation } from "react-router";

import styles from "./Layout.module.css";

interface LayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = observer((props) => {
  const { children, ...otherProps } = props;
  const location = useLocation();
  
  const { basketList } = basketStore;
  const totalProducts = basketList.reduce((acc, product) => acc + product.quantity, 0);

  const getActiveTab = () => {
    if (location.pathname?.startsWith(RoutePath.basket)) return 2;
    if (location.pathname?.startsWith(RoutePath.activeOrders)) return 3;
    if (location.pathname?.startsWith(RoutePath.products)) return 1;
    return 0;
  };

  return (
    <div className={styles.container} {...otherProps}>
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
            icon={<Storefront />}
            label="Продукты"
            value={1}
          />
          <BottomNavigationAction
            component={Link}
            to={RoutePath.activeOrders}
            className={styles.navItem}
            icon={<ListAlt />}
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
                <ShoppingBasket />
              </Badge>
            }
            label="Корзина"
          />
        </BottomNavigation>
      </Paper>
    </div>
  );
});