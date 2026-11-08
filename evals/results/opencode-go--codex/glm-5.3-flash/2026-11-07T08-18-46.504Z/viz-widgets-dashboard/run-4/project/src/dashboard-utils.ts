export type DashboardLayout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DashboardLayouts = Record<string, DashboardLayout[]>;

export const dashboardStorageKey = 'dashboard-grid-layout-v1';

export const defaultLayout: DashboardLayout[] = [
  { i: 'revenue', x: 0, y: 0, w: 4, h: 6 },
  { i: 'traffic', x: 4, y: 0, w: 8, h: 8 },
  { i: 'tasks', x: 0, y: 6, w: 6, h: 9 },
  { i: 'activity', x: 6, y: 6, w: 6, h: 9 },
  { i: 'alerts', x: 0, y: 15, w: 4, h: 5 },
  { i: 'uptime', x: 4, y: 15, w: 4, h: 5 },
];

export const dashboardBreakpoints = { lg: 1080, md: 760, sm: 480 };
export const dashboardColumns = { lg: 12, md: 8, sm: 4 };

export function compactLayouts(layout: DashboardLayout[]): DashboardLayouts {
  return {
    lg: layout,
    md: layout.map((item) => ({ ...item, w: Math.min(item.w, dashboardColumns.md) })),
    sm: layout.map((item) => ({ ...item, w: Math.min(item.w, dashboardColumns.sm) })),
  };
}

export function isValidDashboardLayout(layout: DashboardLayout[], knownIds: string[]): boolean {
  const known = new Set(knownIds);
  return layout.length > 0 && layout.every((item) => known.has(item.i));
}

export function readLayouts(widgetIds: string[]): DashboardLayouts {
  try {
    const raw = localStorage.getItem(dashboardStorageKey);
    if (!raw) return compactLayouts(defaultLayout);

    const parsed = JSON.parse(raw) as Partial<DashboardLayouts>;
    if (!parsed.lg || !isValidDashboardLayout(parsed.lg, widgetIds)) {
      return compactLayouts(defaultLayout);
    }
    return {
      lg: parsed.lg,
      md: parsed.md ?? compactLayouts(parsed.lg).md,
      sm: parsed.sm ?? compactLayouts(parsed.lg).sm,
    };
  } catch {
    return compactLayouts(defaultLayout);
  }
}
