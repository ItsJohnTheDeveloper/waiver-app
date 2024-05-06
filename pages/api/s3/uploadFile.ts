import S3 from 'aws-sdk/clients/s3';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfUserIsAdmin } from '../auth/utils';

const S3_DISABLED =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

const s3 = new S3({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  signatureVersion: 'v4'
});

export default async function createFile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { name, type } = req.body;

  checkIfUserIsAdmin(req, res);

  // if in dev, skip adding to S3.
  if (S3_DISABLED) {
    return res.status(200).json({ url: 'http://localhost:3000' });
  }

  if (!name || !type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const fileParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `waivers/${name}`,
    Expires: 600,
    ContentType: type
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', fileParams);
    return res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
};
