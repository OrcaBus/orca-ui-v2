export type ApiErrorKind = 'network' | 'forbidden' | 'server' | 'unavailable' | 'generic';

export interface ApiErrorDetails {
  kind: ApiErrorKind;
  statusCode?: number;
  detail?: string;
}

function isHtmlLike(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes('<!doctype html') ||
    normalized.includes('<html') ||
    normalized.includes('<body') ||
    normalized.includes('&lt;!doctype html') ||
    normalized.includes('&lt;html')
  );
}

function getStringValue(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function getStatusCode(obj: Record<string, unknown>) {
  return typeof obj.status === 'number'
    ? obj.status
    : typeof obj.statusCode === 'number'
      ? obj.statusCode
      : undefined;
}

function sanitizeDetail(detail: string | undefined) {
  if (!detail || isHtmlLike(detail)) return undefined;
  return detail;
}

export function resolveApiErrorDetails(error: unknown): ApiErrorDetails {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (isHtmlLike(error.message)) {
      return { kind: 'unavailable' };
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      return { kind: 'network' };
    }
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    const status = getStatusCode(obj);

    if (status !== undefined) {
      const msg = getStringValue(obj, ['message', 'detail', 'error', 'statusText']);
      const detail = sanitizeDetail(msg);

      if (msg && isHtmlLike(msg)) {
        return { kind: 'unavailable', statusCode: status };
      }

      if (status === 403 || status === 401) {
        return { kind: 'forbidden', statusCode: status, detail };
      }
      if (status >= 500) {
        return { kind: 'server', statusCode: status, detail };
      }
      return { kind: 'generic', statusCode: status, detail };
    }
  }

  if (error instanceof Error) {
    return { kind: 'generic', detail: sanitizeDetail(error.message) };
  }

  return {
    kind: typeof error === 'string' && isHtmlLike(error) ? 'unavailable' : 'generic',
    detail: typeof error === 'string' ? sanitizeDetail(error) : undefined,
  };
}
