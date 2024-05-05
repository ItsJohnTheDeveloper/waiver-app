import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const parseCSV = async (file: string) => {
  const csvFile = fs.readFileSync(path.resolve(file), 'utf-8');
  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      header: true,
      complete: (result) => {
        resolve(result.data);
      }
    });
  });
};

export async function Seed(csvPath: string, tableName: string) {
  await sql.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        createdAt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        dateOfAppt TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        firstLastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        dob TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        tattooLocation VARCHAR(255) NOT NULL,
        signatureDate TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        waiverDownloadUrl TEXT NOT NULL
      )
    `);

  const submissionData = (await parseCSV(csvPath)) as any[];
  // insert data.
  const promises = submissionData.map((submission) => {
    const createdAtDate = new Date(submission.createdAt).toISOString();
    const dateOfApptDate = new Date(submission.dateOfAppt).toISOString();
    const dobDate = new Date(submission.dob).toISOString();
    const signatureDate = new Date(submission.signatureDate).toISOString();

    return sql.query(`
        INSERT INTO ${tableName} (createdAt, dateOfAppt, firstLastName, email, phone, dob, tattooLocation, signatureDate, waiverDownloadUrl)
        VALUES (
          '${createdAtDate}',
          '${dateOfApptDate}', 
          '${submission.firstLastName}', 
          '${submission.email}',
          '${submission.phone}',
          '${dobDate}',
          '${submission.tattooLocation}',
          '${signatureDate}',
          '${submission.waiverDownloadUrl}')
          `);
  });

  try {
    const results = await Promise.all(promises);
    console.log(`seeded ${results.length} submissions.`);

    return results;
  } catch (e) {
    throw e;
  }
}
