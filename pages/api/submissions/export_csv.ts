import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

const submissionFields = {
  id: 'ID',
  createdAt: 'Date Created',
  dateOfAppt: 'Appt. Date',
  firstLastName: 'FullName',
  email: 'Email',
  phone: 'Phone',
  dob: 'Date of Birth',
  tattooLocation: 'Tattoo Location',
  signatureDate: 'Date Signed'
};

interface Submission {
  id: number;
  createdAt: Date;
  dateOfAppt: Date;
  firstLastName: string;
  email: string;
  phone: string;
  dob: Date;
  tattooLocation: string;
  signatureDate: Date;
}

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

        submissions.forEach((submission: Submission) => {
          const row = Object.keys(submissionFields).map((fieldName) => {
            if (typeof submission[fieldName as keyof Submission] === 'object') {
              return new Date(submission[fieldName as keyof Submission])
                .toISOString()
                .slice(0, 10);
            }
            return submission[fieldName as keyof Submission];
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
