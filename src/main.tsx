import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '@fontsource/kanit/400.css';
import '@fontsource/kanit/700.css';
import '@fontsource/athiti/400.css';
import '@fontsource/athiti/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

const theme = createTheme({
  typography: {
    fontFamily: 'Kanit, Athiti, Inter, sans-serif',
  },
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#64748b' },
    background: { default: '#f5f7fa' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 700,
          fontSize: '1.1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
); 