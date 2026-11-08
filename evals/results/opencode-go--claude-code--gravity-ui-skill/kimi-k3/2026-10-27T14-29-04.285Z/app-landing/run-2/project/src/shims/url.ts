// Minimal browser shim for Node's `url` module.
// @gravity-ui/page-constructor's client build imports {format, parse} from 'url';
// only the subset used by its utils/url.js is implemented here.

interface UrlParts {
  protocol?: string | null;
  hostname?: string | null;
  pathname?: string | null;
  hash?: string | null;
  [key: string]: unknown;
}

export function parse(urlStr: string): UrlParts {
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(urlStr);
  const parsed = new URL(urlStr, 'https://placeholder.local');

  return {
    protocol: absolute ? parsed.protocol.replace(/:$/, '') : null,
    hostname: absolute ? parsed.hostname : null,
    pathname: parsed.pathname === '/' && !urlStr.startsWith('/') ? null : parsed.pathname,
    hash: parsed.hash || null,
  };
}

export function format(parts: UrlParts): string {
  let result = '';

  if (parts.protocol) {
    result += parts.protocol.endsWith(':') ? parts.protocol : `${parts.protocol}:`;
  }
  if (parts.hostname) {
    result += `//${parts.hostname}`;
  }
  if (parts.pathname) {
    result += parts.pathname;
  }
  if (parts.hash) {
    result += parts.hash;
  }

  return result;
}
