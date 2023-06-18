'use client';

import { Button, Text, Title } from '@tremor/react';
import Search from '../search';

export default function PlaygroundPage() {
  const mockNum = 10;

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>
        Search for an individual waiver by name, email, or phone number.
      </Text>
      <Search />

      <Title className="mt-10">Export</Title>
      <Text>{`Waivers to be exported ${mockNum}`}</Text>
      <Button size="xl" className="mt-4">
        Export .csv
      </Button>
    </main>
  );
}
