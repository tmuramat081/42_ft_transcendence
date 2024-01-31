//"use client";
import type { Metadata } from 'next'
import './globals.css'
import { LoginUserProvider } from '@/providers/useAuth'
import { AccessControlProvider } from '@/providers/useAccessControl'
import { SessionProvider } from 'next-auth/react';
import { getServerSession } from "next-auth";
import { options } from './options';
//import { auth } from './auth';
import { NextAuthProvider } from './NextAuthProvider';

export const metadata: Metadata = {
  title: 'ft_transcendence',
  description: 'school 42 subject',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  //const session = await auth(); 
  const session = await getServerSession(options);
  return (
    <>
    <NextAuthProvider session={session}>
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
    </NextAuthProvider>
    </>
  )
}
