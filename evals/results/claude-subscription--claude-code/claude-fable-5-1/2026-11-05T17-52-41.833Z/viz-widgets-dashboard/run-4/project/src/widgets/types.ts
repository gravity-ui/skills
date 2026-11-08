import type { WidgetFrameProps } from './WidgetFrame';

/** Что сетка передаёт каждому виджету: он сам рисует рамку (WidgetFrame) и содержимое. */
export type WidgetProps = Omit<WidgetFrameProps, 'children' | 'actions' | 'subtitle'>;
