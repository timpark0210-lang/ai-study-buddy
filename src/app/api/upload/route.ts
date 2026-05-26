import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'ai-study-buddy-materials';

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.GCS_BUCKET_NAME || !process.env.GCP_PROJECT_ID) {
    console.error('[Upload API] Critical: GCP_PROJECT_ID or GCS_BUCKET_NAME missing in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing GCP settings. Please contact the administrator.' },
      { status: 500 }
    );
  }

  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and contentType are required.' }, { status: 400 });
    }

    const allowedContentTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedContentTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type. Only PDF, JPG, PNG, WEBP, and DOCX are supported.' }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `materials/${Date.now()}-${safeFilename}`;
    const file = storage.bucket(BUCKET_NAME).file(finalFilename);

    // Generate V4 signed URL for uploading
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${finalFilename}`;

    return NextResponse.json({ uploadUrl, publicUrl, filename: finalFilename });
  } catch (error) {
    console.error('[Upload API] Error generating Signed URL:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
