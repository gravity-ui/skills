import type {HTMLAttributes, KeyboardEvent, ReactNode} from 'react';
import {Grip, Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';

interface WidgetFrameProps {
  title: string;
  locked: boolean;
  actions?: ReactNode;
  onRemove: () => void;
  /** pointer + keyboard handlers for the drag handle (header) */
  dragHandleProps?: HTMLAttributes<HTMLElement>;
  resizeHandleProps?: HTMLAttributes<HTMLElement>;
  onHeaderKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  children: ReactNode;
}

export function WidgetFrame({
  title,
  locked,
  actions,
  onRemove,
  dragHandleProps,
  resizeHandleProps,
  onHeaderKeyDown,
  children,
}: WidgetFrameProps) {
  return (
    <section className={`wf${locked ? ' wf-locked' : ''}`} aria-label={title}>
      <header
        className="wf-head"
        tabIndex={locked ? -1 : 0}
        aria-label={
          locked
            ? title
            : `${title}. Перетащите мышью или используйте стрелки для перемещения, Shift+стрелки — для изменения размера`
        }
        onKeyDown={locked ? undefined : onHeaderKeyDown}
        {...(locked ? {} : dragHandleProps)}
      >
        <Icon data={Grip} size={14} className="wf-grip" aria-hidden />
        <span className="wf-title">{title}</span>
        <span className="wf-spacer" />
        {actions && (
          <span className="wf-actions" onPointerDown={(e) => e.stopPropagation()}>
            {actions}
          </span>
        )}
        {!locked && (
          <span onPointerDown={(e) => e.stopPropagation()}>
            <Button
              view="flat"
              size="s"
              onClick={onRemove}
              aria-label={`Удалить виджет «${title}»`}
            >
              <Icon data={Xmark} size={14} />
            </Button>
          </span>
        )}
      </header>
      <div className="wf-body">{children}</div>
      {!locked && (
        <span
          className="wf-resize"
          role="separator"
          aria-label={`Изменить размер виджета «${title}»`}
          {...resizeHandleProps}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M9 1 L1 9 M9 5 L5 9 M9 9 L9 9" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      )}
    </section>
  );
}
