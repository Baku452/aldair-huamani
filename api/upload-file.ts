import { handleUpload } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: {
        headers: req.headers,
        url: `https://${req.headers.host}${req.url}`,
      } as unknown as Request,
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
          ],
        };
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (err) {
    return res.status(400).json({
      error: 'Upload failed',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
