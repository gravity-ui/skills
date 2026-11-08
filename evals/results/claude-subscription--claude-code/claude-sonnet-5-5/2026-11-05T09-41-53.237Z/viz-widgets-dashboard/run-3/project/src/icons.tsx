import React from 'react';

const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, focusable: false } as const;

export const GripIcon = () => (
  <svg {...base} fill="currentColor">
    {[4, 8, 12].map((y) =>
      [5.5, 10.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />),
    )}
  </svg>
);
export const CloseIcon = () => (
  <svg {...base} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const PlusIcon = () => (
  <svg {...base} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);
export const ResetIcon = () => (
  <svg {...base} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" />
  </svg>
);
export const ArrowIcon = ({ up }: { up: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden focusable={false}>
    {up ? <path d="M5 1.5l4 6.5H1z" /> : <path d="M5 8.5L1 2h8z" />}
  </svg>
);
export const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden focusable={false}>
    <path d="M8 1.5l7 12.5H1L8 1.5zm-.75 4.5v4h1.5V6h-1.5zm0 5v1.5h1.5V11h-1.5z" fillRule="evenodd" />
  </svg>
);
export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false}>
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
);
