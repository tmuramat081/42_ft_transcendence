import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Room',
  description: 'Game Room',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
