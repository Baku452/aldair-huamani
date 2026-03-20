import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPO_OWNER = 'Baku452';
const REPO_NAME = 'pdf-selector';

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

async function uploadFileToRepo(
  token: string,
  fileName: string,
  fileBase64: string,
  issueNumber: number
): Promise<string | null> {
  const path = `bug-attachments/issue-${issueNumber}/${fileName}`;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: GITHUB_HEADERS(token),
    body: JSON.stringify({
      message: `Attachment for issue #${issueNumber}: ${fileName}`,
      content: fileBase64,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.content?.download_url || null;
}

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

  const { project, name, email, title, description, fileName, fileBase64 } = req.body || {};

  if (!project || !name || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let attachmentSection = '';

  try {
    // Create issue first (without attachment)
    const issueBody =
      `## Bug Report\n\n` +
      `**Project:** ${project}\n` +
      `**Reported by:** ${name}\n` +
      `**Email:** ${email || 'N/A'}\n\n` +
      `### Description\n\n${description}`;

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

    // Upload file if provided, then update issue body
    if (fileName && fileBase64) {
      const downloadUrl = await uploadFileToRepo(token, fileName, fileBase64, issue.number);
      if (downloadUrl) {
        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
        attachmentSection = isImage
          ? `\n\n### Attachment\n\n![${fileName}](${downloadUrl})`
          : `\n\n### Attachment\n\n[${fileName}](${downloadUrl})`;

        // Update issue with attachment link
        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue.number}`,
          {
            method: 'PATCH',
            headers: GITHUB_HEADERS(token),
            body: JSON.stringify({
              body: issueBody + attachmentSection,
            }),
          }
        );
      }
    }

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
