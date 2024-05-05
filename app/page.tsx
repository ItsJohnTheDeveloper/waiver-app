import { Title } from '@tremor/react';
import WaiverForm from './components/waiver-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '@joytattoo.van - Waiver'
};

export default async function IndexPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title className="mt-4">Waiver</Title>
      <WaiverForm />
    </main>
  );
}
