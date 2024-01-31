"use client";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
export const NextAuthProvider = ({ children, session}:{children: React.ReactNode, session:Session | null}) => {
  return (
    <SessionProvider session={session}  refetchOnWindowFocus={false}> 
      {children}
    </SessionProvider>
  )
};