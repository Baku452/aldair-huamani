const prerender = false;
const REPO_OWNER = "Baku452";
const REPO_NAME = "pdf-selector";
const POST = async ({ request }) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({
        error: "Server misconfigured",
        hint: "GITHUB_TOKEN env var is not set"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const { project, name, email, title, description } = body;
  if (!project || !name || !title || !description) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const issueBody = `## Bug Report

**Project:** ${project}
**Reported by:** ${name}
**Email:** ${email || "N/A"}

### Description

${description}`;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          title: `[Bug] ${title}`,
          body: issueBody,
          labels: ["bug"]
        })
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({
          error: "Failed to create issue",
          details: err
        }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const issue = await res.json();
    return new Response(
      JSON.stringify({
        success: true,
        issueUrl: issue.html_url,
        issueNumber: issue.number
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        message: String(err)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
