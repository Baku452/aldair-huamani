import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Server misconfigured',
      hint: 'BLOB_READ_WRITE_TOKEN env var is not set',
    });
  }

  try {
    const { pathname, callbackUrl, multipart, clientPayload } = req.body || {};

    if (!pathname) {
      return res.status(400).json({ error: 'Missing pathname' });
    }

    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
      pathname,
      onUploadCompleted: {
        callbackUrl: callbackUrl || '',
      },
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
      ...(multipart ? { multipart } : {}),
      ...(clientPayload ? { clientPayload } : {}),
    });

    return res.status(200).json({ type: 'blob.generate-client-token', clientToken });
  } catch (err) {
    return res.status(400).json({
      error: 'Token generation failed',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
