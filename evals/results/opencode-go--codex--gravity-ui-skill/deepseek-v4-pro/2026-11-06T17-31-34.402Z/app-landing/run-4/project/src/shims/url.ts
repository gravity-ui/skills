// Browser-compatible shim for Node.js `url` module used by @gravity-ui/page-constructor

export function parse(urlString: string) {
  if (!urlString) return {};
  try {
    const u = new URL(urlString, 'https://example.org');
    return {
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      pathname: u.pathname,
      port: u.port || null,
      host: u.host,
      search: u.search || null,
      query: u.searchParams,
      hash: u.hash || null,
    };
  } catch {
    return {};
  }
}

export function format(obj: Record<string, string | null | undefined>) {
  const protocol = obj.protocol || 'https';
  const hostname = obj.hostname || '';
  const pathname = obj.pathname || '';
  const search = obj.search || '';
  const hash = obj.hash || '';
  return `${protocol}://${hostname}${pathname}${search}${hash}`;
}
