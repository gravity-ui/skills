declare module 'react-grid-layout' {
  export type Layout = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    static?: boolean;
  };

  export type Layouts = Record<string, Layout[]>;

  export const WidthProvider: (
    component: unknown,
  ) => React.ComponentType<Record<string, unknown>>;

  export const Responsive: unknown;

  const GridLayout: unknown;
  export default GridLayout;
}
