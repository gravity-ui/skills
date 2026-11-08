import type { CSSProperties } from "react";
export type IconName =
  | "grid"
  | "chart"
  | "layers"
  | "activity"
  | "settings"
  | "arrow"
  | "chevron"
  | "calendar"
  | "refresh"
  | "download"
  | "more"
  | "plus"
  | "close"
  | "check"
  | "clock"
  | "external"
  | "book"
  | "search"
  | "bell"
  | "wallet"
  | "cart"
  | "users"
  | "target"
  | "help"
  | "logout"
  | "expand"
  | "pause";
const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h17M7 14l4-4 4 2 5-7" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  settings: (
    <>
      <path d="m9 4 1-2h4l1 2 2 1 2-.2 2 3.5-1 2v3.4l1 2-2 3.5-2-.2-2 1-1 2h-4l-1-2-2-1-2 .2-2-3.5 1-2v-3.4l-1-2 2-3.5 2 .2 2-1Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v4m10-4v4M3 11h18" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.5 7a7 7 0 0 1 11.8-2L20 8M4 16l2.7 3a7 7 0 0 0 11.8-2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />
    </>
  ),
  book: (
    <>
      <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </>
  ),
  bell: (
    <>
      <path d="M5 17h14l-2-3V9A5 5 0 0 0 7 9v5l-2 3Zm5 4h4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 8V5l14-3v3m4 6h-6v5h6M17 13.5h.1" />
    </>
  ),
  cart: (
    <>
      <path d="M2 3h3l3 13h11l3-9H6" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21v-2a7 7 0 0 1 14 0v2M17 4a4 4 0 0 1 0 8m2 3c2 1 3 3 3 6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 1 1 4 3c-1 .4-1 1-1 2m0 3h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9 3H3v18h6m6-15 6 6-6 6m-7-6h13" />
    </>
  ),
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  style,
  className = "",
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
