import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Check if user is authorized and is admin
        const session = await getSession({ req });
        const authorizedEmails = process.env.AUTHORIZED_EMAIL?.split(',');
        if (authorizedEmails?.indexOf(session?.user?.email ?? '') === -1) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const submissions = await prisma.submission.findMany();
        return res.status(200).json(submissions);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unable to GET submissions' });
      }
      break;

    case 'POST':
      try {
        const { body } = req;
        const result = await prisma.submission.create({
          data: {
            dateOfAppt: body.dateOfAppt,
            firstLastName: body.firstLastName,
            email: body.email,
            phone: body.phone,
            dob: body.dob,
            tattooLocation: body.tattooLocation,
            signatureDate: body.signatureDate,
            waiverDownloadUrl: body.waiverDownloadUrl
          }
        });
        return res.status(201).json(result);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unable to POST submission' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
