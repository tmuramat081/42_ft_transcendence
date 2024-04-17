'use client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';

/**
 * 配色やスタイルを定義する場合はここに記述する
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#00babc', // light blue
      light: '#33ffff',
      dark: '#007f7f',
    },
    secondary: {
      main: '#29292e', // gray
      light: '#f5f5f5',
      dark: '#18181d',
    },
    text: {
      primary: '#333', // black
      secondary: '#666',
    },
    background: {
      default: '#18181d',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
  },
});

/**
 * サイト全体で使用するグローバルテーマ
 */
const GlobalThemeProvider = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default GlobalThemeProvider;
