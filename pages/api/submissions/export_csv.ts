import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';
import S3 from 'aws-sdk/clients/s3';
import { PGSubmission } from '../../../lib/types';
import { sql } from '@vercel/postgres';

const TABLE_NAME = process.env.DB_TABLE_NAME;

const s3 = new S3({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  signatureVersion: 'v4'
});

const submissionFields = {
  id: 'ID',
  createdat: 'Date Created',
  dateofappt: 'Appt. Date',
  firstlastname: 'FullName',
  email: 'Email',
  phone: 'Phone',
  dob: 'Date of Birth',
  tattoolocation: 'Tattoo Location',
  signaturedate: 'Date Signed',
  waiverdownloadurl: 'Waiver Download URL'
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
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const query = `SELECT * FROM ${TABLE_NAME};`;

        const { rows: submissions } = await sql.query(query);
        const headers = Object.values(submissionFields);
        const csv = [headers.join(',')];

        const promises: Promise<string>[] = submissions.map(
          async (submission: PGSubmission) => {
            const row = await Promise.all(
              Object.keys(submissionFields).map(async (name) => {
                const fieldName = name as keyof PGSubmission;

                if (
                  fieldName === 'waiverdownloadurl' &&
                  submission[fieldName].includes('s3')
                ) {
                  const fileParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: submission.waiverdownloadurl
                      .split('waiver-app.s3.us-west-2.amazonaws.com/')[1]
                      .replaceAll(/%3A/g, ':'),
                    Expires: 604800 // 7 days
                  };
                  return await s3.getSignedUrlPromise('getObject', fileParams);
                }

                if (
                  fieldName === 'createdat' ||
                  fieldName === 'dateofappt' ||
                  fieldName === 'dob' ||
                  fieldName === 'signaturedate'
                ) {
                  return new Date(submission[fieldName])
                    .toISOString()
                    .split('T')[0];
                }
                return submission[fieldName as keyof PGSubmission];
              })
            );

            return row.join(',');
          }
        );

        const results = await Promise.all(promises);
        csv.push(...results);

        res.setHeader('Content-Type', 'text/csv');
        return res.status(200).send(csv.join('\n'));
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unable to GET submissions' });
      }
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
