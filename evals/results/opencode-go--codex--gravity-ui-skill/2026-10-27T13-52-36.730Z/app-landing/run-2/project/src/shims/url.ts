type ParsedUrl = URL & { slashes?: boolean; host: string; pathname: string; protocol: string };

export function format(input: ParsedUrl | string): string {
  if (typeof input === 'string') {
    return input;
  }

  return `${input.protocol}//${input.host}${input.pathname}`;
}

export function parse(input: string): ParsedUrl {
  if (!input) {
    const emptyUrl = new URL('https://localhost/');
    emptyUrl.protocol = '';

    return emptyUrl as ParsedUrl;
  }

  const url = new URL(/^\w+:\/\//.test(input) ? input : `https://${input}`);

  return url as ParsedUrl;
}
