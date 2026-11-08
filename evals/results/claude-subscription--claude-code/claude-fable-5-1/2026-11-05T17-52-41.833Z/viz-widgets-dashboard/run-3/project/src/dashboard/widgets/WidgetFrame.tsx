import * as React from 'react';
import {Button, Card, DropdownMenu, Icon, Text} from '@gravity-ui/uikit';

import type {DragHandleProps} from '../GridLayout';
import {ChartIcon, EllipsisIcon, GripIcon, ListIcon, TrashIcon} from '../icons';

export type WidgetView = 'chart' | 'table';

export interface WidgetFrameProps {
  title: string;
  editable: boolean;
  dragHandleProps?: DragHandleProps;
  supportsTable: boolean;
  view: WidgetView;
  onViewChange: (view: WidgetView) => void;
  onRemove: () => void;
  children: React.ReactNode;
}

/** Card chrome shared by every widget: drag handle, title, table-view toggle, menu. */
export function WidgetFrame({
  title,
  editable,
  dragHandleProps,
  supportsTable,
  view,
  onViewChange,
  onRemove,
  children,
}: WidgetFrameProps) {
  const menuItems = [
    ...(supportsTable
      ? [
          {
            text: view === 'table' ? 'Показать график' : 'Показать таблицу',
            iconStart: <Icon data={view === 'table' ? ChartIcon : ListIcon} size={16} />,
            action: () => onViewChange(view === 'table' ? 'chart' : 'table'),
          },
        ]
      : []),
    ...(editable
      ? [
          {
            text: 'Удалить виджет',
            theme: 'danger' as const,
            iconStart: <Icon data={TrashIcon} size={16} />,
            action: onRemove,
          },
        ]
      : []),
  ];

  return (
    <Card type="container" view="outlined" className="widget">
      <div className="widget__header">
        {editable && dragHandleProps ? (
          <Button
            view="flat-secondary"
            size="s"
            className="widget__handle"
            aria-label={`Переместить виджет «${title}»`}
            onPointerDown={dragHandleProps.onPointerDown}
            style={dragHandleProps.style}
          >
            <Icon data={GripIcon} size={16} />
          </Button>
        ) : null}
        <Text as="h2" variant="subheader-1" ellipsis className="widget__title" title={title}>
          {title}
        </Text>
        {supportsTable ? (
          <Button
            view="flat-secondary"
            size="s"
            selected={view === 'table'}
            aria-pressed={view === 'table'}
            aria-label={view === 'table' ? 'Показать график' : 'Показать таблицу'}
            title={view === 'table' ? 'Показать график' : 'Показать таблицу'}
            onClick={() => onViewChange(view === 'table' ? 'chart' : 'table')}
          >
            <Icon data={view === 'table' ? ChartIcon : ListIcon} size={16} />
          </Button>
        ) : null}
        {menuItems.length > 0 ? (
          <DropdownMenu
            size="s"
            items={menuItems}
            renderSwitcher={(props) => (
              <Button view="flat-secondary" size="s" aria-label={`Действия с виджетом «${title}»`} {...props}>
                <Icon data={EllipsisIcon} size={16} />
              </Button>
            )}
          />
        ) : null}
      </div>
      <div className="widget__body">{children}</div>
    </Card>
  );
}
