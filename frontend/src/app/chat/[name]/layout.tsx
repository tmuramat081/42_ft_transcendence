/* eslint-disable */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DM Page',
  description: 'direct message page.',
};

export default function DMLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
