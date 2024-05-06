import axios from 'axios';
export default async function fetcher(...args: Parameters<typeof axios.get>) {
  const res = await axios.get(...args);
  return res.data;
}
