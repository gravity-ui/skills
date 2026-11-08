export interface WidgetDef {
  id: string;
  title: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface DashboardState {
  widgets: WidgetDef[];
  columns: number;
}
