import './globals.css';

import { Suspense } from 'react';
import Navbar from './components/navbar';
import { getServerSession } from 'next-auth';

export const metadata = {
  title: 'React - Waiver App',
  description:
    'A user admin dashboard configured with Next.js Vercel/postgres, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Navbar user={session?.user} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
