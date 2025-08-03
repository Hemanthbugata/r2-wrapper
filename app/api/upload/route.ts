import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate the file
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Configure upload parameters
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    // Upload file to R2
    await r2Client.send(new PutObjectCommand(uploadParams));

    // Generate file URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // Return success response
    return NextResponse.json({
      success: true,
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      url: fileUrl,
    }, { status: 201 });
  } catch (error: any) {
     console.error('Upload error:', error);
     return NextResponse.json(
       { error: error.message || 'Upload failed' },
       { status: 500 }
      );
   }
}

export async function GET() {
  return NextResponse.json({ status: 'OK', timestamp: new Date().toISOString() });
}
