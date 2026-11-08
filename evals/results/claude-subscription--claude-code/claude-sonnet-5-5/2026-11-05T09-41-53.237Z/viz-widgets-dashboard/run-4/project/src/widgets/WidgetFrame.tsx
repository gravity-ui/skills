import React, { useState } from 'react';
import type { ItemBinding } from '../grid/Grid';
import { useElementSize } from '../hooks';
import { ChartIcon, CloseIcon, GripIcon, TableIcon } from '../icons';
import { DataTable } from './parts';
import type { WidgetDef } from './registry';

interface Props {
  def: WidgetDef;
  days: number;
  binding: ItemBinding;
  onRemove: () => void;
}

export function WidgetFrame({ def, days, binding, onRemove }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [bodyRef, size] = useElementSize<HTMLDivElement>();
  const { dragging, resizing, disabled } = binding;
  const asTable = view === 'table' && def.table;

  return (
    <section
      className={'widget' + (dragging || resizing ? ' widget_active' : '')}
      aria-label={def.title}
    >
      <header
        className={'widget__head' + (disabled ? '' : ' widget__head_draggable')}
        {...(disabled ? {} : binding.dragProps)}
      >
        {!disabled && (
          <button
            type="button"
            className="icon-btn widget__grip"
            aria-label={`Переместить виджет «${def.title}». Стрелки — переместить, Shift и стрелки — изменить размер`}
            {...binding.gripProps}
          >
            <GripIcon />
          </button>
        )}
        <div className="widget__titles">
          <h2 className="widget__title">{def.title}</h2>
          {def.subtitle && <span className="widget__subtitle">{def.subtitle(days)}</span>}
        </div>
        <div className="widget__actions" data-no-drag>
          {def.table && (
            <button
              type="button"
              className="icon-btn"
              aria-pressed={view === 'table'}
              aria-label={view === 'table' ? 'Показать график' : 'Показать таблицу'}
              title={view === 'table' ? 'Показать график' : 'Показать таблицу'}
              onClick={() => setView(view === 'table' ? 'chart' : 'table')}
            >
              {view === 'table' ? <ChartIcon /> : <TableIcon />}
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            aria-label={`Убрать виджет «${def.title}»`}
            title="Убрать с дашборда"
            onClick={onRemove}
          >
            <CloseIcon />
          </button>
        </div>
      </header>
      <div className="widget__body" ref={bodyRef}>
        {size.width > 0 &&
          (asTable ? (
            <DataTable data={def.table!(days)} label={`${def.title}: таблица`} />
          ) : (
            def.render({ days, width: size.width, height: size.height })
          ))}
      </div>
      {!disabled && <div className="widget__resize" aria-hidden {...binding.resizeProps} />}
    </section>
  );
}
