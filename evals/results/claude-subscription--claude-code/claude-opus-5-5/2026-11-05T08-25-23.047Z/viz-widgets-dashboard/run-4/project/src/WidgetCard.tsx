import React from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import { ChartColumn, Grip, LayoutRows, Xmark } from '@gravity-ui/icons';

import type { GridItemContext } from './grid/DashboardGrid';

interface WidgetCardProps {
  title: string;
  ctx: GridItemContext;
  showTable: boolean;
  onToggleTable?: () => void;
  onRemove: () => void;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function WidgetCard({ title, ctx, showTable, onToggleTable, onRemove, scrollable, children }: WidgetCardProps) {
  return (
    <section
      className={`widget${ctx.editable ? ' widget_editable' : ''}${ctx.dragging ? ' widget_dragging' : ''}`}
      aria-label={title}
    >
      <header className="widget__header" {...(ctx.editable ? ctx.dragAreaProps : {})}>
        {ctx.editable && (
          <button
            type="button"
            className="widget__grip"
            aria-label={`Переместить виджет «${title}»`}
            {...ctx.handleProps}
          >
            <Icon data={Grip} size={14} />
          </button>
        )}
        <h2 className="widget__title" title={title}>
          {title}
        </h2>
        <div className="widget__actions" data-no-drag>
          {onToggleTable && (
            <Button
              view="flat-secondary"
              size="s"
              onClick={onToggleTable}
              title={showTable ? 'Показать график' : 'Показать таблицей'}
              aria-label={showTable ? 'Показать график' : 'Показать таблицей'}
              aria-pressed={showTable}
            >
              <Icon data={showTable ? ChartColumn : LayoutRows} size={14} />
            </Button>
          )}
          {ctx.editable && (
            <Button
              view="flat-secondary"
              size="s"
              onClick={onRemove}
              title="Убрать с дашборда"
              aria-label={`Убрать виджет «${title}»`}
            >
              <Icon data={Xmark} size={14} />
            </Button>
          )}
        </div>
      </header>
      <div className={`widget__body${scrollable || showTable ? ' widget__body_scroll' : ''}`}>{children}</div>
    </section>
  );
}
