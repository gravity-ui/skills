import * as React from 'react';
import { Button, Icon, Text } from '@gravity-ui/uikit';

import { useGridItem } from '../grid/DashboardGrid';
import { GripIcon, XmarkIcon, TableIcon, ChartIcon } from '../icons';

export interface WidgetFrameProps {
  title: string;
  subtitle?: string;
  /** Табличный двойник графика; если задан, в шапке появится переключатель. */
  tableView?: React.ReactNode;
  onRemove?: () => void;
  /** Дополнительные элементы шапки (легенда и т.п.) */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function WidgetFrame({ title, subtitle, tableView, onRemove, toolbar, children }: WidgetFrameProps) {
  const grid = useGridItem();
  const [showTable, setShowTable] = React.useState(false);

  return (
    <section className={`widget ${grid.isDragging ? 'widget_dragging' : ''}`} aria-label={title}>
      <header className="widget__header" onPointerDown={grid.dragHandleProps.onPointerDown} style={grid.dragHandleProps.style}>
        <button
          type="button"
          className="widget__grip"
          aria-label={grid.locked ? 'Раскладка заблокирована' : `Переместить виджет «${title}». Стрелки — двигать, Shift + стрелки — менять размер`}
          disabled={grid.locked}
          onKeyDown={grid.dragHandleProps.onKeyDown}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Icon data={GripIcon} size={14} />
        </button>
        <div className="widget__titles">
          <Text as="h2" variant="subheader-2" ellipsis className="widget__title">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption-2" color="secondary" ellipsis>
              {subtitle}
            </Text>
          )}
        </div>
        <div className="widget__actions" onPointerDown={(event) => event.stopPropagation()}>
          {toolbar}
          {tableView && (
            <Button
              view="flat-secondary"
              size="s"
              aria-pressed={showTable}
              title={showTable ? 'Показать график' : 'Показать таблицу'}
              aria-label={showTable ? 'Показать график' : 'Показать таблицу'}
              onClick={() => setShowTable((v) => !v)}
            >
              <Icon data={showTable ? ChartIcon : TableIcon} size={14} />
            </Button>
          )}
          {onRemove && (
            <Button view="flat-secondary" size="s" title="Скрыть виджет" aria-label={`Скрыть виджет «${title}»`} onClick={onRemove}>
              <Icon data={XmarkIcon} size={14} />
            </Button>
          )}
        </div>
      </header>
      <div className="widget__body">{showTable && tableView ? <div className="widget__table">{tableView}</div> : children}</div>
      {!grid.locked && (
        <button
          type="button"
          className="widget__resize"
          aria-label={`Изменить размер виджета «${title}». Стрелки меняют ширину и высоту`}
          {...grid.resizeHandleProps}
        />
      )}
    </section>
  );
}
