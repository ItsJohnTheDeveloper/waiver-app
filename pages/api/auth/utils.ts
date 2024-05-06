import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export const checkIfUserIsAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession({ req });
  const authorizedEmails = process.env.AUTHORIZED_EMAIL?.split(',');
  if (authorizedEmails?.indexOf(session?.user?.email ?? '') === -1) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
};
