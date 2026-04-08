import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // 1. 보안 체크: 토큰이 없는 경우 타임아웃 방지를 위해 즉시 에러 반환
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[Upload API] Critical: BLOB_READ_WRITE_TOKEN is missing in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing storage token. Please contact the administrator.' },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 🔥 Phase 3: Added support for PDF, Image and DOCX
        return {
          /* MIME Type Mismatch 의심으로 인한 임시 주석 처리
          allowedContentTypes: [
            'application/pdf', 
            'image/jpeg', 
            'image/png', 
            'image/webp',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          */
          // 용량 초과로 인한 97% 무한 로딩(가짜 CORS) 방지를 위해 최대 용량 20MB 명확히 설정
          maximumSizeInBytes: 20 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            userId: 'user_dev_asher', 
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This hook is called on the server when a file is successfully uploaded
        console.log('[Upload API] Blob upload completed successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('[Upload API] Error during handleUpload:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
