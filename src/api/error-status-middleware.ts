import type { Middleware } from 'openapi-fetch';

/**
 * openapi-react-query throws the parsed JSON error body as-is (see its
 * `if (error) throw error` in the generated query/mutation functions), and
 * the generated OpenAPI error schemas never include an HTTP status field
 * (e.g. `{ message: string }`). Without one, `resolveApiErrorDetails`
 * (src/api/api-error-details.ts) can never tell a 403 from a 500 — every
 * failure, permission-denied included, falls back to its generic message
 * and the backend's own detail text is dropped along with it.
 *
 * This middleware stamps `status` onto the response body (when it's JSON
 * and doesn't already have one) before openapi-fetch parses and throws it,
 * so `resolveApiErrorDetails`'s existing `getStatusCode` branch — which
 * already reads `obj.status`/`obj.statusCode` — has something to find.
 */
export const errorStatusMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return undefined;

    let body: unknown;
    try {
      body = await response.clone().json();
    } catch {
      // Not a JSON body (e.g. an HTML error page) — resolveApiErrorDetails
      // already has separate handling for that case. Leave it untouched.
      return undefined;
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return undefined;
    }
    if ('status' in body) {
      return undefined;
    }

    const patched = { ...body, status: response.status };
    return new Response(JSON.stringify(patched), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};
