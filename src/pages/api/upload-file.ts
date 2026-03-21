import type { APIRoute } from 'astro';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const token = import.meta.env.BLOB_READ_WRITE_TOKEN;

    const jsonResponse = await handleUpload({
      token,
      body: body as HandleUploadBody,
      request,
      onBeforeGenerateToken: async () => {
        return {
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
          allowedContentTypes: [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'text/plain',
            'application/octet-stream', // fallback for files browsers don't detect
            'text/csv',
            'application/json',
            'application/zip',
            'application/x-zip-compressed',
          ],
        };
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Upload failed',
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
