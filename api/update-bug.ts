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

  const { issueNumber, files } = req.body || {};
  const fileList: { name: string; url: string }[] = Array.isArray(files) ? files : [];

  if (!issueNumber || fileList.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: issueNumber, files[]' });
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

    // Build attachment markdown for all files
    const newLinks = fileList.map((f) => {
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
      return isImage ? `![${f.name}](${f.url})` : `- [${f.name}](${f.url})`;
    });

    // Append to existing attachments or create new section
    let updatedBody = issue.body || '';
    if (updatedBody.includes('### Attachments')) {
      updatedBody = updatedBody.replace(
        /### Attachments\n\n([\s\S]*)$/m,
        (_, existing: string) => `### Attachments\n\n${existing.trim()}\n${newLinks.join('\n')}`
      );
    } else if (updatedBody.includes('### Attachment')) {
      // Migrate old single-attachment format
      updatedBody = updatedBody.replace(
        /### Attachment\n\n([\s\S]*)$/m,
        (_, existing: string) => `### Attachments\n\n${existing.trim()}\n${newLinks.join('\n')}`
      );
    } else {
      updatedBody += `\n\n### Attachments\n\n${newLinks.join('\n')}`;
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
      filesUploaded: fileList.length,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error',
      message: String(err),
    });
  }
}
