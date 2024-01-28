import type { Metadata } from 'next'
import './globals.css'
import { LoginUserProvider } from '@/providers/useAuth'
import { AccessControlProvider } from '@/providers/useAccessControl'

export const metadata: Metadata = {
  title: 'ft_transcendence',
  description: 'school 42 subject',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>

        <html lang="en">
          <body>
            {children}
          </body>
        </html>

    </>
  )
}
