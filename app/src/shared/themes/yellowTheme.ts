import { createTheme } from "@mui/material/styles";

export const yellowOrangeTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#FFA000', // Ярко-оранжевый
        dark: '#FF6F00', // Темно-оранжевый
        light: '#FFC107', // Светло-желтый
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#FFD54F', // Золотисто-желтый
        dark: '#FFB300',
        light: '#FFE082',
        contrastText: '#000000',
      },
      background: {
        default: '#FFF8E1', // Очень светлый желтый
        paper: '#FFFFFF',
      },
      text: {
        primary: '#212121',
        secondary: '#424242',
      },
      error: {
        main: '#D32F2F',
      },
      warning: {
        main: '#FFA000',
      },
      info: {
        main: '#1976D2',
      },
      success: {
        main: '#388E3C',
      },
    },
    typography: {
      fontFamily: '"Nunito Sans", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        color: '#FF6F00',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        color: '#FF8F00',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        color: '#FFA000',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 4px rgba(255, 160, 0, 0.3)',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#FF8F00',
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'linear-gradient(45deg, #FFA000 0%, #FFD54F 100%)',
            color: '#ffffff',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(255, 160, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid #FFE082',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(255, 160, 0, 0.2)',
            },
          },
        },
      },
    },
  });