import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat Page',
  description: 'chat page.',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
