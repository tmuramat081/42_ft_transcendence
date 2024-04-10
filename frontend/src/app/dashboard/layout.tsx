import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ダッシュボード画面',
  description: 'dashboard.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
