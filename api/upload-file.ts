// /api/upload-file.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import type { File, Fields, Files } from 'formidable';

// Allow file parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: VercelRequest): Promise<{ fields: Fields; files: Files }> =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({ 
      multiples: false,
      keepExtensions: true,
      uploadDir: '/tmp' // Writable directory for Vercel serverless environment
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { files } = await parseForm(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : (files.file as File);
    
    if (!file || !file.filepath) {
      console.error('No file or filepath missing:', file);
      return res.status(400).json({ error: 'No file uploaded or filepath missing' });
    }

    const rawB64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64 || '';
    console.log("📦 rawB64 length:", rawB64.length);
    
    const jsonString = Buffer.from(rawB64, 'base64').toString('utf-8');
    console.log("📄 Decoded JSON preview:", jsonString.slice(0, 100));
    
    const serviceAccount = JSON.parse(jsonString);

    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });

    const uploadResponse = await drive.files.create({
      requestBody: {
        name: file.originalFilename ?? 'uploaded_file',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''],
      },
      media: {
        mimeType: file.mimetype ?? 'application/octet-stream',
        body: fs.createReadStream(file.filepath),
      },
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true, // ✅ Required for Shared Drives
    });

    const fileId = uploadResponse.data.id;

    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true, // ✅ Also needed here
    });

    res.status(200).json({
      fileName: uploadResponse.data.name,
      fileId: uploadResponse.data.id,
      viewLink: uploadResponse.data.webViewLink,
      downloadLink: uploadResponse.data.webContentLink,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
}
