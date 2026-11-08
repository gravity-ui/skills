// Browser shim for the Node `url` module.
// @gravity-ui/page-constructor's ESM build imports {parse, format} from 'url'
// (used only by its getAbsolutePath util). This minimal implementation covers
// exactly that usage: parse decomposes a URL string, format recomposes one
// from {protocol, hostname, pathname} parts.

export interface UrlParts {
  protocol?: string | null;
  hostname?: string | null;
  pathname?: string | null;
}

export function parse(urlStr: string): UrlParts {
  try {
    const u = new URL(urlStr);
    return {
      protocol: u.protocol.replace(/:$/, ''),
      hostname: u.hostname,
      pathname: u.pathname,
    };
  } catch {
    // Relative or bare path — no protocol/host
    return {protocol: null, hostname: null, pathname: urlStr};
  }
}

export function format(parts: UrlParts): string {
  const protocol = parts.protocol ? `${parts.protocol.replace(/:$/, '')}:` : '';
  const host = parts.hostname ? `//${parts.hostname}` : '';
  return `${protocol}${host}${parts.pathname ?? ''}`;
}
