'use client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';

/**
 * 配色やスタイルを定義する場合はここに記述する
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#00babc', // 青
    },
    secondary: {
      main: '#ffffff', // 白
    },
    text: {
      primary: '#333', // 黒
      secondary: '#666',
    },
    background: {
      default: '#18181d',
      paper: '#f5f5f5',
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
