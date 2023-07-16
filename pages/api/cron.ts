import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.lifesupport.update({
      where: { id: 1 },
      data: { updatedAt: new Date() }
    });
    return res.status(200).json({ message: '(CRON) success' });
  } catch (err) {
    return res.status(500).json({ message: '(CRON) error has occurred' });
  }
}
