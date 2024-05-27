import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Room Page',
  description: 'chat room page.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
