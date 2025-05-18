import { FC } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./App.css";
import "normalize.css";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Правильный импорт
import AuthProvider from "@/app/providers/AuthProvider/ui/AuthProvider";
import { yellowOrangeTheme } from "@/shared/themes/yellowTheme";
import { ProductsPageLazy } from "@/pages/ProductsPage/ui/ProductsPageLazy";
import { BasketPageLazy } from "@/pages/BasketPage/BasketPageLazy";
import { OrderPageLazy } from "@/pages/OrderPage/ui/OrderPageLazy";
import { RoutePath } from "@/shared/routes/routeConfig";
import { ActiveOrderPage } from "@/pages/ActiveOrderPage/ui/ActiveOrderPage/ActiveOrderPage";

const queryClient = new QueryClient();

export const App: FC = () => {
  return (
    <ThemeProvider theme={yellowOrangeTheme}>
      <BrowserRouter basename='/'>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Routes>
                <Route path={RoutePath.home} element={<ProductsPageLazy/>} />
                <Route path={RoutePath.products} element={<ProductsPageLazy/>} />
                <Route path={RoutePath.basket} element={<BasketPageLazy/>} />
                <Route path={RoutePath.order} element={<OrderPageLazy/>} />
                <Route path={RoutePath.activeOrders} element={<ActiveOrderPage/>} />
              </Routes>
            </AuthProvider>
          <CssBaseline />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{
              backgroundColor: "#FFFFFF",
              borderLeft: "4px solid #FFA000",
              color: "#212121",
            }}
          />
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};