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

export const POST: APIRoute = async ({ request }) => {
  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Server misconfigured', hint: 'GITHUB_TOKEN not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { project, name, email, title, description, files } = await request.json();

  if (!project || !name || !title || !description) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileList: { name: string; url: string }[] = Array.isArray(files) ? files : [];
  let attachmentSection = '';
  if (fileList.length > 0) {
    const links = fileList.map((f) => {
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
      return isImage ? `![${f.name}](${f.url})` : `- [${f.name}](${f.url})`;
    });
    attachmentSection = `\n\n### Attachments\n\n${links.join('\n')}`;
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
      return new Response(JSON.stringify({ error: 'Failed to create issue', details: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const issue = await response.json();

    return new Response(
      JSON.stringify({ success: true, issueUrl: issue.html_url, issueNumber: issue.number }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', message: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
