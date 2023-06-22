import axios from 'axios';

export const handleUploadWaiverPicture = async (
  file: File,
  callback: (waiverImageUrl: string | undefined) => void
) => {
  try {
    const res = await axios.post('/api/s3/uploadFile', {
      name: file.name,
      type: file.type
    });

    // finally, upload the file to S3 bucket
    const downloadURL = res?.data?.url || '';
    await axios.put(downloadURL, file, {
      headers: {
        'Content-Type': file.type,
        'access-control-allow-origin': '*'
      }
    });

    const imageUrl = /[^?]*/g.exec(downloadURL)?.[0]; // regex to cleanse url, getting it without query strings)
    callback(imageUrl);
  } catch (err) {
    console.log(err);
    throw err;
  }
};
