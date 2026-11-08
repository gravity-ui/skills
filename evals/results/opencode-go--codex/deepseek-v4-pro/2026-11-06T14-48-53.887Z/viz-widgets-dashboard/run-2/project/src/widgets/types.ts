import type { ReactNode } from 'react';

export interface WidgetDef {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'text';
  title: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
}

export interface WidgetProps {
  id: string;
}
