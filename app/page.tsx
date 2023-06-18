import { Title } from '@tremor/react';
import WaiverForm from './waiver-form';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title className="mt-4">Waiver</Title>
      <WaiverForm />
    </main>
  );
}
