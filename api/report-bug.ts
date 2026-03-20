import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPO_OWNER = 'Baku452';
const REPO_NAME = 'pdf-selector';

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Server misconfigured',
      hint: 'GITHUB_TOKEN env var is not set',
    });
  }

  const { project, name, email, title, description, fileName, fileUrl } = req.body || {};

  if (!project || !name || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build attachment section if file was uploaded to Vercel Blob
  let attachmentSection = '';
  if (fileName && fileUrl) {
    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
    attachmentSection = isImage
      ? `\n\n### Attachment\n\n![${fileName}](${fileUrl})`
      : `\n\n### Attachment\n\n[${fileName}](${fileUrl})`;
  }

  const issueBody =
    `## Bug Report\n\n` +
    `**Project:** ${project}\n` +
    `**Reported by:** ${name}\n` +
    `**Email:** ${email || 'N/A'}\n\n` +
    `### Description\n\n${description}` +
    attachmentSection;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: 'POST',
        headers: GITHUB_HEADERS(token),
        body: JSON.stringify({
          title: `[Bug] ${title}`,
          body: issueBody,
          labels: ['bug'],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({
        error: 'Failed to create issue',
        details: err,
      });
    }

    const issue = await response.json();

    return res.status(201).json({
      success: true,
      issueUrl: issue.html_url,
      issueNumber: issue.number,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error',
      message: String(err),
    });
  }
}
