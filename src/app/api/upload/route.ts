import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const projectId = process.env.GCP_PROJECT_ID;
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      return NextResponse.json({ error: 'GCS_BUCKET_NAME is not configured' }, { status: 500 });
    }

    const storage = new Storage({ projectId });
    const bucket = storage.bucket(bucketName);
    
    // Generate a unique path for the file in the bucket
    const fileName = `materials/${Date.now()}-${file.name}`;
    const gcsFile = bucket.file(fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await gcsFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      resumable: false,
    });

    // Public GCS URL format
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("GCS Upload Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

