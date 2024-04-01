import type { Metadata } from 'next';
import './globals.css';
import { LoginUserProvider } from '@/providers/useAuth';
import { AccessControlProvider } from '@/providers/useAccessControl';
import GlobalHeader from '@/components/common/header/globalHeader';
import GlobalThemeProvider from '@/providers/globalThemeProvider';
import GlobalFooter from '@/components/common/footer/globalFooter';
import { WebSocketProvider } from '@/providers/webSocketProvider';
import { CssBaseline } from '@mui/material';

export const metadata: Metadata = {
  title: 'ft_transcendence',
  description: 'school 42 subject',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CssBaseline />
      <GlobalThemeProvider>
        <LoginUserProvider>
          <AccessControlProvider>
            <WebSocketProvider>
              <html lang="en">
                <body>
                  <GlobalHeader />
                  <main>{children}</main>
                  <GlobalFooter />
                </body>
              </html>
            </WebSocketProvider>
          </AccessControlProvider>
        </LoginUserProvider>
      </GlobalThemeProvider>
    </>
  );
}
