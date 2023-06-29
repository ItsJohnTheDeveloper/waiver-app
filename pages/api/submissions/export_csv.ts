import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { submission } from '@prisma/client';
import S3 from 'aws-sdk/clients/s3';

const s3 = new S3({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  signatureVersion: 'v4'
});

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
        const authorizedEmails = process.env.AUTHORIZED_EMAIL?.split(',');
        if (authorizedEmails?.indexOf(session?.user?.email ?? '') === -1) {
          res.status(401).json({ error: 'Not authenticated' });
          return;
        }

        const submissions = await prisma.submission.findMany();
        const headers = Object.values(submissionFields);
        const csv = [headers.join(',')];

        const promises = submissions.map(async (submission) => {
          const row = await Promise.all(
            Object.keys(submissionFields).map(async (fieldName) => {
              if (fieldName === 'waiverDownloadUrl') {
                const fileParams = {
                  Bucket: process.env.AWS_S3_BUCKET_NAME,
                  Key: submission.waiverDownloadUrl
                    .split('waiver-app.s3.us-west-2.amazonaws.com/')[1]
                    .replaceAll(/%3A/g, ':'),
                  Expires: 604800 // 7 days
                };
                return await s3.getSignedUrlPromise('getObject', fileParams);
              }

              if (
                typeof submission[fieldName as keyof submission] === 'object'
              ) {
                return new Date(submission[fieldName as keyof submission])
                  .toISOString()
                  .slice(0, 10);
              }
              return submission[fieldName as keyof submission];
            })
          );

          return row.join(',');
        });

        const results = await Promise.all(promises);
        csv.push(...results);

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
