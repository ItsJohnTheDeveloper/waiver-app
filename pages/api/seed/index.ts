import { NextApiRequest, NextApiResponse } from 'next';

export default async function Index(req: NextApiRequest, res: NextApiResponse) {
  return res
    .status(200)
    .json({ message: 'you should not be here, please leave now.' });
}
