import { createTheme } from "@mui/material/styles";

export const marketplaceTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A73E8', // Чистый синий (как у Google, но универсальный)
      dark: '#0D47A1',
      light: '#4285F4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#34A853', // Успешный зеленый (для акцентов)
      dark: '#1E8E3E',
      light: '#81C784',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA', // Очень светлый серый
      paper: '#FFFFFF',
    },
    text: {
      primary: '#202124', // Почти черный
      secondary: '#5F6368', // Серый
      disabled: '#9AA0A6', // Светло-серый
    },
    divider: '#DADCE0', // Очень светлый серый разделитель
    error: {
      main: '#D93025', // Ярко-красный для ошибок
    },
    warning: {
      main: '#F9AB00', // Янтарный
    },
    info: {
      main: '#1A73E8', // Как primary
    },
    success: {
      main: '#34A853', // Как secondary
    },
    action: {
      hover: 'rgba(26, 115, 232, 0.04)', // Очень легкий ховер
      selected: 'rgba(26, 115, 232, 0.08)',
    }
  },
  typography: {
    fontFamily: [
      '"Inter"', 
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          minHeight: '100vh',
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontWeight: 600,
          textTransform: 'none',
          padding: '8px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(26, 115, 232, 0.3)',
          },
        },
        sizeLarge: {
          padding: '10px 32px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '6px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0D47A1',
            boxShadow: '0 1px 3px 0 rgba(13, 71, 161, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid #DADCE0',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.1), 0 2px 6px 2px rgba(60, 64, 67, 0.1)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgba(60, 64, 67, 0.2), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            borderColor: '#1A73E8',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: '#1A73E8',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(26, 115, 232, 0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.12)',
          },
        },
      },
    },
  },
});