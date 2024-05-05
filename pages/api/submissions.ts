import { getSession } from 'next-auth/react';
import { sql } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
import { Submission } from '../../lib/types';

const TABLE_NAME = process.env.DB_TABLE_NAME;

const normalizeSubmissionCreate = (data: Submission) => ({
  dateOfAppt: `'${new Date(data.dateOfAppt).toISOString()}'`,
  firstLastName: `'${data.firstLastName}'`,
  email: `'${data?.email ?? ''}'`,
  phone: `'${data.phone}'`,
  dob: `'${new Date(data.dob).toISOString()}'`,
  tattooLocation: `'${data.tattooLocation}'`,
  signatureDate: `'${new Date(data.signatureDate).toISOString()}'`,
  waiverDownloadUrl: `'${data.waiverDownloadUrl}'`
});

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
        return res.status(200).json({ submissions });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unable to GET submissions' });
      }
    case 'POST':
      try {
        const data = normalizeSubmissionCreate(req.body);
        const query = `INSERT INTO ${TABLE_NAME} (dateOfAppt, firstLastName, email, phone, dob, tattooLocation, signatureDate, waiverDownloadUrl) VALUES (${data.dateOfAppt}, ${data.firstLastName}, ${data.email}, ${data.phone}, ${data.dob}, ${data.tattooLocation}, ${data.signatureDate}, ${data.waiverDownloadUrl}) RETURNING *;`;
        const { rows: result } = await sql.query(query);

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
