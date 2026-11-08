import { parseLayout, settle, type LayoutItem, type LimitsById } from './layout';

const KEY = 'viz-dashboard:layout:v1';

/** Load the saved layout, or the defaults when there is none or it is unreadable. */
export function loadLayout(defaults: LayoutItem[], limits: LimitsById): LayoutItem[] {
  try {
    return parseLayout(JSON.parse(window.localStorage.getItem(KEY) ?? 'null'), defaults, limits);
  } catch {
    return settle(defaults, limits);
  }
}

export function saveLayout(layout: LayoutItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(layout));
  } catch {
    // Storage is unavailable (private mode, quota): the layout still works for this session.
  }
}

export function clearLayout(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}
