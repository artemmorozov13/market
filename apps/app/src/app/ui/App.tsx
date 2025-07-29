import { FC } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./App.css";
import "normalize.css";
import { BrowserRouter, } from "react-router-dom";
import AuthProvider from "@/app/providers/AuthProvider/ui/AuthProvider";
import { RouteProvider } from "../providers/RouteProvider";
import { marketplaceTheme } from "@/shared/themes/marketplaceTheme";

const queryClient = new QueryClient();

export const App: FC = () => {
  return (
    <ThemeProvider theme={marketplaceTheme}>
      <BrowserRouter basename='/'>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouteProvider/>
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