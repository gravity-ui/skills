import { Button, Card, Icon, Text } from '@gravity-ui/uikit';
import { Grip, Xmark } from '@gravity-ui/icons';
import type { ReactNode } from 'react';

import type { DragHandleProps } from '../dashboard/GridLayout';

import './WidgetFrame.css';

export interface WidgetFrameProps {
  title: string;
  subtitle?: string;
  dragHandleProps: DragHandleProps;
  resizeHandle: ReactNode;
  editable: boolean;
  dragging: boolean;
  onRemove: () => void;
  /** Доп. элементы управления справа в шапке (например, переключатель график/таблица). */
  actions?: ReactNode;
  children: ReactNode;
}

export function WidgetFrame({
  title,
  subtitle,
  dragHandleProps,
  resizeHandle,
  editable,
  dragging,
  onRemove,
  actions,
  children,
}: WidgetFrameProps) {
  return (
    <Card view="outlined" className={`widget${dragging ? ' widget_dragging' : ''}`} role="group" aria-label={title}>
      <div className="widget__header">
        {editable && (
          <span {...dragHandleProps} className="widget__grip" title="Перетащите, чтобы переместить">
            <Icon data={Grip} size={16} />
          </span>
        )}
        <div className="widget__titles">
          <Text variant="subheader-2" ellipsis className="widget__title">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption-2" color="secondary" ellipsis>
              {subtitle}
            </Text>
          )}
        </div>
        <div className="widget__actions">
          {actions}
          {editable && (
            <Button view="flat-secondary" size="s" onClick={onRemove} aria-label={`Удалить виджет «${title}»`}>
              <Icon data={Xmark} size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="widget__body">{children}</div>
      {resizeHandle}
    </Card>
  );
}
