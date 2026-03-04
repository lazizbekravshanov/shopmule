/**
 * Create a real Request object for testing Next.js route handlers.
 */
export function createMockRequest(
  method: string,
  url: string,
  options?: { body?: unknown; headers?: Record<string, string> }
): Request {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  if (options?.body && method !== "GET" && method !== "HEAD") {
    init.body = JSON.stringify(options.body);
  }

  return new Request(url, init);
}
