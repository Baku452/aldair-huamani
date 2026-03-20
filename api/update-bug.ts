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

  // Check if file already exists (to get sha for overwrite)
  const checkRes = await fetch(url, { headers: GITHUB_HEADERS(token) });
  let sha: string | undefined;
  if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  }

  const body: Record<string, string> = {
    message: `Attachment for issue #${issueNumber}: ${fileName}`,
    content: fileBase64,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: GITHUB_HEADERS(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.content?.download_url || null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Server misconfigured',
      hint: 'GITHUB_TOKEN env var is not set',
    });
  }

  const { issueNumber, fileName, fileBase64 } = req.body || {};

  if (!issueNumber || !fileName || !fileBase64) {
    return res.status(400).json({ error: 'Missing required fields: issueNumber, fileName, fileBase64' });
  }

  try {
    // Fetch current issue body
    const issueRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`,
      { headers: GITHUB_HEADERS(token) }
    );

    if (!issueRes.ok) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = await issueRes.json();

    // Upload file
    const downloadUrl = await uploadFileToRepo(token, fileName, fileBase64, issueNumber);
    if (!downloadUrl) {
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Build attachment markdown
    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
    const attachmentLink = isImage
      ? `![${fileName}](${downloadUrl})`
      : `[${fileName}](${downloadUrl})`;

    // Append or update attachment section
    let updatedBody = issue.body || '';
    if (updatedBody.includes('### Attachment')) {
      updatedBody = updatedBody.replace(
        /### Attachment\n\n[\s\S]*$/m,
        `### Attachment\n\n${attachmentLink}`
      );
    } else {
      updatedBody += `\n\n### Attachment\n\n${attachmentLink}`;
    }

    // Update the issue
    const updateRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: GITHUB_HEADERS(token),
        body: JSON.stringify({ body: updatedBody }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return res.status(updateRes.status).json({
        error: 'Failed to update issue',
        details: err,
      });
    }

    return res.status(200).json({
      success: true,
      attachmentUrl: downloadUrl,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error',
      message: String(err),
    });
  }
}
