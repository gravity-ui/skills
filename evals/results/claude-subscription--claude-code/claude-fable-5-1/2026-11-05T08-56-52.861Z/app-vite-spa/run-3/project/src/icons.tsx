import type * as React from 'react';

type SvgProps = React.SVGProps<SVGSVGElement>;

export function SunIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M8 1a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 1Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3.5 8a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm9.95-4.389a.75.75 0 0 1 0 1.06l-.707.708a.75.75 0 1 1-1.06-1.061l.707-.707a.75.75 0 0 1 1.06 0ZM15 8a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 15 8Zm-2.611 5.45a.75.75 0 0 1-1.06 0l-.708-.707a.75.75 0 1 1 1.061-1.06l.707.707a.75.75 0 0 1 0 1.06ZM8 15a.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 1.5 0v1A.75.75 0 0 1 8 15Zm-5.45-2.611a.75.75 0 0 1 0-1.06l.707-.708a.75.75 0 1 1 1.06 1.061l-.707.707a.75.75 0 0 1-1.06 0ZM1 8a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 1 8Zm2.611-5.45a.75.75 0 0 1 1.06 0l.708.707a.75.75 0 1 1-1.061 1.06l-.707-.707a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

export function MoonIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        d="M6.57 1.21a.75.75 0 0 1 .173.837A5.5 5.5 0 0 0 13.953 9.3a.75.75 0 0 1 1.01.84A7 7 0 1 1 5.86.98a.75.75 0 0 1 .71.23ZM5.07 2.96a5.5 5.5 0 1 0 8.08 7.86A7 7 0 0 1 5.07 2.96Z"
      />
    </svg>
  );
}
