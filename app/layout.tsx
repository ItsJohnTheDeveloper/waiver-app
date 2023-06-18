import './globals.css';

import { Suspense } from 'react';
import Navbar from './navbar';

export const metadata = {
  title: 'React - Waiver App',
  description:
    'A user admin dashboard configured with Next.js, PlanetScale, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Navbar user={null} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
