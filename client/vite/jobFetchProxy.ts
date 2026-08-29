import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

const FETCH_PATH = "/api/fetch-job";

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "0.0.0.0" || host === "[::1]" || host === "::1") return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, string>,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function handleFetchJob(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const requestUrl = req.url;
  if (!requestUrl?.startsWith(FETCH_PATH)) {
    next();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  let target: URL;
  try {
    const encoded = new URL(requestUrl, "http://vite.local").searchParams.get(
      "url",
    );
    if (!encoded) {
      sendJson(res, 400, { error: "Enter a valid job listing URL." });
      return;
    }
    target = new URL(encoded);
  } catch {
    sendJson(res, 400, { error: "Enter a valid job listing URL." });
    return;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    sendJson(res, 400, { error: "Enter a valid job listing URL." });
    return;
  }

  if (isBlockedHost(target.hostname)) {
    sendJson(res, 400, { error: "That URL cannot be fetched." });
    return;
  }

  try {
    const response = await fetch(target.href, {
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      sendJson(res, 502, {
        error: "Could not fetch job details from this URL.",
      });
      return;
    }

    const html = await response.text();
    sendJson(res, 200, { html });
  } catch {
    sendJson(res, 502, {
      error: "Could not fetch job details from this URL.",
    });
  }
}

export function jobFetchProxy(): Plugin {
  return {
    name: "job-fetch-proxy",
    configureServer(server) {
      server.middlewares.use(handleFetchJob);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleFetchJob);
    },
  };
}
