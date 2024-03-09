import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Room list',
  description: 'Game Room list.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
