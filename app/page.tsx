import { Title } from '@tremor/react';
import Head from 'next/head';
import WaiverForm from './waiver-form';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title className="mt-4">Waiver</Title>
        <WaiverForm />
      </main>
    </div>
  );
}
