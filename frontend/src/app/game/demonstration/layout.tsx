import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pong game demonstration',
  description: 'demonstration for game design.',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {children}
    </section>
  )
}
