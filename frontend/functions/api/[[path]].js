export async function onRequest({ request, env }) {
  if (!env.BACKEND_URL) {
    return new Response("BACKEND_URL is not configured.", {
      status: 500,
    });
  }

  let target;

  try {
    target = new URL(env.BACKEND_URL);
  } catch {
    return new Response("BACKEND_URL is invalid.", {
      status: 500,
    });
  }

  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password
  ) {
    return new Response(
      "BACKEND_URL must be an HTTPS URL without credentials.",
      { status: 500 }
    );
  }

  const incoming = new URL(request.url);

  // Change only the path and query, never the configured backend host.
  target.pathname = incoming.pathname;
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("X-Forwarded-Proto", incoming.protocol.slice(0, -1));
  headers.set("X-Forwarded-Host", incoming.host);

  const init = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return fetch(new Request(target.toString(), init));
}