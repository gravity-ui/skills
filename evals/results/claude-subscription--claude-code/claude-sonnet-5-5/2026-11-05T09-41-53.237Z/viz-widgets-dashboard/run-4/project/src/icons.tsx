import React from 'react';

type P = { size?: number; className?: string };
const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export const GripIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className} stroke="none" fill="currentColor">
    {[3.5, 8, 12.5].flatMap((cy) => [5.5, 10.5].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.1} />))}
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p.size)} className={p.className}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const PlusIcon = (p: P) => (
  <svg {...base(p.size)} className={p.className}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);
export const TableIcon = (p: P) => (
  <svg {...base(p.size)} className={p.className}>
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <path d="M2 6.5h12M6 6.5V13" />
  </svg>
);
export const ChartIcon = (p: P) => (
  <svg {...base(p.size)} className={p.className}>
    <path d="M2.5 13.5h11M3.5 10l3-3.5 2.5 2 4-5" />
  </svg>
);
export const ResetIcon = (p: P) => (
  <svg {...base(p.size)} className={p.className}>
    <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" />
  </svg>
);
export const ArrowUpIcon = (p: P) => (
  <svg {...base(p.size ?? 12)} className={p.className} strokeWidth={2}>
    <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
  </svg>
);
export const ArrowDownIcon = (p: P) => (
  <svg {...base(p.size ?? 12)} className={p.className} strokeWidth={2}>
    <path d="M8 3v10M3.5 8.5L8 13l4.5-4.5" />
  </svg>
);

/** Иконки статусов различаются формой, а не только цветом. */
export const StatusIcon = ({ kind, size = 14 }: { kind: 'good' | 'warning' | 'serious' | 'critical'; size?: number }) => {
  const common = { ...base(size), strokeWidth: 1.6 };
  switch (kind) {
    case 'good':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" />
          <path d="M5.2 8.2l2 2 3.6-4" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common}>
          <path d="M8 2.2l6 10.6H2z" />
          <path d="M8 6.4v3M8 11.3v.01" />
        </svg>
      );
    case 'serious':
      return (
        <svg {...common}>
          <path d="M8 1.8l6.2 6.2L8 14.2 1.8 8z" />
          <path d="M8 5.6v3M8 10.6v.01" />
        </svg>
      );
    case 'critical':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" />
          <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" />
        </svg>
      );
  }
};
