import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DM Page',
  description: 'direct message page.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
