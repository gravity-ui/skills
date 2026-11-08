/** Monthly active users (thousands) per platform, 2025. */
export interface SeriesPoint {
  x: number;
  y: number;
}

export interface PlatformSeries {
  name: string;
  data: SeriesPoint[];
}

const MONTHS_2025 = Array.from({ length: 12 }, (_, i) => Date.UTC(2025, i, 1));

function toPoints(values: number[]): SeriesPoint[] {
  return values.map((y, i) => ({ x: MONTHS_2025[i], y }));
}

export const MAU_BY_PLATFORM: PlatformSeries[] = [
  { name: 'Web', data: toPoints([312, 325, 341, 338, 356, 372, 369, 384, 401, 418, 433, 452]) },
  { name: 'iOS', data: toPoints([188, 195, 207, 214, 226, 231, 240, 254, 262, 275, 289, 301]) },
  { name: 'Android', data: toPoints([146, 152, 158, 171, 176, 190, 198, 205, 219, 228, 236, 249]) },
];
