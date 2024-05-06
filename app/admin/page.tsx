'use client';

import { Bold, Button, Text, Title } from '@tremor/react';
import useSWR from 'swr';
import fetcher from '../../helpers/fetcher';
import fileDownload from 'js-file-download';
import axios from 'axios';

const downloadCSVFile = async () => {
  try {
    const response = await axios.get('/api/submissions/export_csv', {
      responseType: 'blob',
      headers: {
        accept: 'text/csv'
      }
    });

    if (!response?.data) {
      throw new Error('No file to download');
    }

    const filename = `waivers_${new Date().toISOString().slice(0, 10)}.csv`;

    fileDownload(response.data, filename);
  } catch (err) {
    console.error(err);
  }
};

export default function Index() {
  const { data, isLoading, error } = useSWR('/api/submissions', fetcher);
  const submissions = data?.submissions || [];

  const unauthorized = error?.response?.status === 401;

  if (unauthorized) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>{error?.response?.data?.error}</Title>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title className="mt-10">Export</Title>
      {isLoading ? (
        <Text>...loading</Text>
      ) : (
        <>
          <Text>
            Waivers to be exported <Bold>({submissions?.length})</Bold>
          </Text>
          <Button size="xl" className="mt-4" onClick={downloadCSVFile}>
            Export .csv
          </Button>
        </>
      )}
    </main>
  );
}
