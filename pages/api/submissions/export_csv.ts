import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { submission } from '@prisma/client';

const submissionFields = {
  id: 'ID',
  createdAt: 'Date Created',
  dateOfAppt: 'Appt. Date',
  firstLastName: 'FullName',
  email: 'Email',
  phone: 'Phone',
  dob: 'Date of Birth',
  tattooLocation: 'Tattoo Location',
  signatureDate: 'Date Signed',
  waiverDownloadUrl: 'Waiver Download URL'
};

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
        if (session?.user?.email !== process.env.AUTHORIZED_EMAIL) {
          res.status(401).json({ error: 'Not authenticated' });
          return;
        }

        const submissions = await prisma.submission.findMany();
        const headers = Object.values(submissionFields);
        const csv = [headers.join(',')];

        submissions.forEach((submission: submission) => {
          const row = Object.keys(submissionFields).map((fieldName) => {
            if (typeof submission[fieldName as keyof submission] === 'object') {
              return new Date(submission[fieldName as keyof submission])
                .toISOString()
                .slice(0, 10);
            }
            return submission[fieldName as keyof submission];
          });
          csv.push(row.join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csv.join('\n'));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Unable to GET submissions' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
