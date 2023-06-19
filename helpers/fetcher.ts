import axios from 'axios';
export default async function fetcher(...args: unknown[]) {
  // @ts-expect-error
  const res = await axios.get(...args);
  return res.data;
}
