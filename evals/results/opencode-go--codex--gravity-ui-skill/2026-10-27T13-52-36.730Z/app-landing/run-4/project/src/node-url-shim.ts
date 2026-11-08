interface LegacyUrl {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

export function parse(input: string): LegacyUrl {
  if (!input) {
    return {};
  }

  const url = new URL(input, 'https://example.org');
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

export function format(url: LegacyUrl): string {
  const host = url.hostname ? (url.port ? `${url.hostname}:${url.port}` : url.hostname) : '';
  const authority = host ? `//${host}` : '';
  return `${url.protocol ?? ''}${authority}${url.pathname ?? ''}${url.search ?? ''}${url.hash ?? ''}`;
}
