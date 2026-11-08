// Minimal browser shim for Node's `url` module.
// Used only by page-constructor code paths (VideoBlock / Share block) that are
// not part of this landing page; satisfies Rollup's named-import check.
export function parse(urlString: string) {
  const u = new URL(urlString, 'https://example.org');
  const absolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(urlString);
  return {
    protocol: absolute ? u.protocol : null,
    hostname: absolute ? u.hostname : null,
    pathname: u.pathname,
  };
}

export function format(parts: {
  protocol?: string | null;
  hostname?: string | null;
  pathname?: string | null;
}) {
  return `${parts.protocol ? `${parts.protocol}//` : ''}${parts.hostname ?? ''}${
    parts.pathname ?? ''
  }`;
}
