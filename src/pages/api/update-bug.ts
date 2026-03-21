import type { APIRoute } from 'astro';

export const prerender = false;

const REPO_OWNER = 'Baku452';
const REPO_NAME = 'pdf-selector';

const GITHUB_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

export const PATCH: APIRoute = async ({ request }) => {
  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Server misconfigured', hint: 'GITHUB_TOKEN not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { issueNumber, files } = await request.json();
  const fileList: { name: string; url: string }[] = Array.isArray(files) ? files : [];

  if (!issueNumber || fileList.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing required fields: issueNumber, files[]' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const issueRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`,
      { headers: GITHUB_HEADERS(token) }
    );

    if (!issueRes.ok) {
      return new Response(JSON.stringify({ error: 'Issue not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const issue = await issueRes.json();

    const newLinks = fileList.map((f) => {
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
      return isImage ? `![${f.name}](${f.url})` : `- [${f.name}](${f.url})`;
    });

    let updatedBody = issue.body || '';
    if (updatedBody.includes('### Attachments')) {
      updatedBody = updatedBody.replace(
        /### Attachments\n\n([\s\S]*)$/m,
        (_: string, existing: string) => `### Attachments\n\n${existing.trim()}\n${newLinks.join('\n')}`
      );
    } else if (updatedBody.includes('### Attachment')) {
      updatedBody = updatedBody.replace(
        /### Attachment\n\n([\s\S]*)$/m,
        (_: string, existing: string) => `### Attachments\n\n${existing.trim()}\n${newLinks.join('\n')}`
      );
    } else {
      updatedBody += `\n\n### Attachments\n\n${newLinks.join('\n')}`;
    }

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
      return new Response(JSON.stringify({ error: 'Failed to update issue', details: err }), {
        status: updateRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, filesUploaded: fileList.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
