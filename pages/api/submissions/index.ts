import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const submissions = await prisma.submission.findMany();
        res.status(200).json(submissions);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Unable to GET submissions' });
      }
      break;

    case 'POST':
      try {
        const body = JSON.parse(req.body);
        const result = await prisma.submission.create({
          data: {
            dateOfAppt: body.dateOfAppt,
            firstLastName: body.firstLastName,
            email: body.email,
            phone: body.phone,
            dob: body.dob,
            tattooLocation: body.tattooLocation,
            signatureDate: body.signatureDate
          }
        });
        res.status(200).json(result);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Unable to POST submission' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
