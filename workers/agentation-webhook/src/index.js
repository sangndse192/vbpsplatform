// ============================================================
// DOMAIN → REPO MAPPING
// Add new projects here, then redeploy: npm run deploy
// ============================================================
const DOMAIN_TO_REPO = {
  "localhost": "sangndse192/vbpsplatform",
  "127.0.0.1": "sangndse192/vbpsplatform",
  "0.0.0.0": "sangndse192/vbpsplatform",
  // Vercel preview deployments
  "vbpsplatform.vercel.app": "sangndse192/vbpsplatform",
  // Add production domains as deployed:
  // "dev.vbsp.9stack.vn": "sangndse192/vbpsplatform",
};

// Allowed CORS origins (restrict to known domains)
const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/0\.0\.0\.0(:\d+)?$/,
  /^https:\/\/(dev|staging|app)\.[a-z]+\.9stack\.vn$/,
  /^https:\/\/vbpsplatform.*\.vercel\.app$/,
];

// ============================================================
// MAIN HANDLER
// ============================================================
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsOrigin = getCorsOrigin(origin);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(corsOrigin),
      });
    }

    if (request.method !== "POST") {
      return respond({ error: "Method not allowed" }, 405, corsOrigin);
    }

    // Verify webhook secret
    const secret = request.headers.get("X-Agentation-Secret");
    if (secret !== env.WEBHOOK_SECRET) {
      return respond({ error: "Unauthorized" }, 401, corsOrigin);
    }

    // Reject oversized payloads (100KB limit)
    const contentLength = parseInt(request.headers.get("Content-Length") || "0", 10);
    if (contentLength > 100_000) {
      return respond({ error: "Payload too large" }, 413, corsOrigin);
    }

    try {
      const payload = await request.json();
      const result = await handleEvent(payload, env);
      return respond(result.body, result.status, corsOrigin);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return new Response(
          JSON.stringify({ error: "Rate limited", retryAfter: err.retryAfter }),
          {
            status: 429,
            headers: { "Retry-After": err.retryAfter, "Content-Type": "application/json", ...corsHeaders(corsOrigin) },
          },
        );
      }
      console.error("Worker error:", err);
      return respond({ error: "Internal error" }, 500, corsOrigin);
    }
  },
};

// ============================================================
// EVENT HANDLER
// ============================================================
async function handleEvent(payload, env) {
  const { event, url, annotation, annotations, output } = payload;

  // Validate URL field
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    return { status: 400, body: { error: "Invalid or missing URL in payload" } };
  }

  const repo = DOMAIN_TO_REPO[domain];

  if (!repo) {
    return {
      status: 400,
      body: { error: `Unknown domain: ${domain}. Add it to DOMAIN_TO_REPO and redeploy.` },
    };
  }

  switch (event) {
    // Single annotation (auto-send or onAnnotationAdd callback)
    case "annotation.add": {
      if (!annotation) {
        return { status: 400, body: { error: "Missing annotation field" } };
      }
      const issue = await createGitHubIssue(env, repo, {
        title: `[QA] ${(annotation.comment || "No comment").slice(0, 80)}`,
        body: formatSingleAnnotation(annotation, url),
        labels: ["qa-feedback", mapKindToLabel(annotation.kind)],
      });
      return {
        status: 201,
        body: { ok: true, issueNumber: issue.number, issueUrl: issue.html_url },
      };
    }

    // Batch submit (onSubmit callback)
    case "submit": {
      const items = annotations || [];
      const issue = await createGitHubIssue(env, repo, {
        title: `[QA Batch] ${items.length} item(s) — ${new URL(url).pathname}`,
        body: formatBatchAnnotations(items, url, output),
        labels: ["qa-feedback", "batch"],
      });
      return {
        status: 201,
        body: { ok: true, issueNumber: issue.number, issueUrl: issue.html_url },
      };
    }

    default:
      return { status: 200, body: { ok: true, skipped: event } };
  }
}

// ============================================================
// GITHUB API
// ============================================================
async function createGitHubIssue(env, repo, { title, body, labels }) {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "agentation-webhook-worker",
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (!res.ok) {
    const errorText = await res.text();

    // Token expired or invalid
    if (res.status === 401) {
      console.error("GitHub token expired or invalid. Rotate the token.");
      throw new Error("GitHub authentication failed — token may be expired");
    }

    // Rate limited
    if (res.status === 403 && res.headers.get("X-RateLimit-Remaining") === "0") {
      const retryAfter = res.headers.get("Retry-After") || "60";
      throw new RateLimitError(`GitHub rate limit exceeded. Retry after ${retryAfter}s`, retryAfter);
    }

    // Validation error
    if (res.status === 422) {
      throw new Error(`GitHub validation error: ${errorText}`);
    }

    throw new Error(`GitHub API error ${res.status}: ${errorText}`);
  }

  return res.json();
}

class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

// ============================================================
// FORMATTING
// ============================================================
function formatSingleAnnotation(a, pageUrl) {
  const sections = [
    `## QA Annotation`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Page** | ${pageUrl} |`,
    `| **Element** | \`${a.elementPath || "N/A"}\` |`,
    `| **Tag** | \`<${a.element || "unknown"}>\` |`,
    `| **CSS Classes** | \`${a.cssClasses || "N/A"}\` |`,
    `| **React Component** | \`${a.reactComponents || "N/A"}\` |`,
    `| **Source File** | \`${a.source || "N/A"}\` |`,
    `| **Annotation ID** | \`${a.id || "N/A"}\` |`,
    ``,
    `### Comment`,
    `> ${a.comment || "No comment"}`,
  ];

  if (a.selectedText) {
    sections.push(``, `### Selected Text`, `> ${a.selectedText}`);
  }

  if (a.boundingBox) {
    const bb = a.boundingBox;
    sections.push(
      ``,
      `### Bounding Box`,
      `- Position: (${bb.x}, ${bb.y})`,
      `- Size: ${bb.width} × ${bb.height}`,
    );
  }

  if (a.computedStyles) {
    sections.push(``, `### Computed Styles`, `\`\`\`css`, a.computedStyles, `\`\`\``);
  }

  if (a.nearbyText) {
    sections.push(``, `### Nearby Text`, `\`\`\``, a.nearbyText, `\`\`\``);
  }

  sections.push(``, `---`, `*Auto-created by Agentation webhook*`);
  return sections.join("\n");
}

function formatBatchAnnotations(annotations, pageUrl, markdownOutput) {
  const sections = [
    `## QA Feedback Batch`,
    ``,
    `**Page:** ${pageUrl}`,
    `**Total:** ${annotations.length} annotation(s)`,
    ``,
    `---`,
  ];

  annotations.forEach((a, i) => {
    sections.push(
      ``,
      `### ${i + 1}. ${a.comment || "No comment"}`,
      `- **Element:** \`${a.elementPath || "N/A"}\``,
      `- **Tag:** \`<${a.element || "unknown"}>\``,
      `- **CSS Classes:** \`${a.cssClasses || "N/A"}\``,
      `- **React Component:** \`${a.reactComponents || "N/A"}\``,
      `- **Source:** \`${a.source || "N/A"}\``,
      `- **ID:** \`${a.id || "N/A"}\``,
    );

    if (a.selectedText) {
      sections.push(`- **Selected Text:** "${a.selectedText}"`);
    }
  });

  if (markdownOutput) {
    sections.push(
      ``,
      `---`,
      ``,
      `### Raw Agentation Output`,
      ``,
      `<details>`,
      `<summary>Click to expand</summary>`,
      ``,
      markdownOutput,
      ``,
      `</details>`,
    );
  }

  sections.push(``, `---`, `*Auto-created by Agentation webhook*`);
  return sections.join("\n");
}

function mapKindToLabel(kind) {
  const map = {
    feedback: "bug",
    placement: "enhancement",
    rearrange: "enhancement",
  };
  return map[kind] || "bug";
}

// ============================================================
// CORS UTILITIES
// ============================================================
function getCorsOrigin(origin) {
  if (!origin) return "";
  const isAllowed = ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
  return isAllowed ? origin : "";
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Agentation-Secret",
    "Access-Control-Max-Age": "86400",
  };
}

function respond(body, status = 200, origin = "") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
