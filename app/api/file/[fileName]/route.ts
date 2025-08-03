import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { fileName: string } }
) {
  try {
    const fileName = params.fileName;
    
    // Create command to get the object
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    });
    
    try {
      // Generate a pre-signed URL that expires in 3600 seconds (1 hour)
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      
      // Return file information
      return NextResponse.json({
        success: true,
        fileName,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${fileName}`,
        signedUrl,
        expiresIn: '1 hour'
      });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve file information' },
      { status: 500 }
    );
  }
}
