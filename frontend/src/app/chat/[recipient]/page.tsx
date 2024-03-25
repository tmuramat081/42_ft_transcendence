'use client';

import DMPage from '@/components/chat/dmPage/dmPage';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const recipient = Array.isArray(params.recipient) ? params.recipient[0] : params.recipient;

  return (
    <article>
      <h2>DMページ</h2>
      <section>
        <DMPage params={recipient} />
      </section>
    </article>
  );
}
