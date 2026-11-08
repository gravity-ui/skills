export interface LayoutItem {
  /** Widget id */
  i: string;
  /** Column index (0-based) */
  x: number;
  /** Row index (0-based) */
  y: number;
  /** Width in columns */
  w: number;
  /** Height in rows */
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type Layout = LayoutItem[];

export interface GridSize {
  w: number;
  h: number;
}
