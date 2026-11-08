import React from 'react';
import type { FrameApi } from './DashboardGrid';
import { CloseIcon, GripIcon } from './icons';

interface Props {
  title: string;
  api: FrameApi;
  onRemove: () => void;
  children: React.ReactNode;
}

/** Общая рамка виджета: шапка-ручка, кнопка скрытия, уголок ресайза. */
export function WidgetFrame({ title, api, onRemove, children }: Props) {
  const { interactive, state } = api;
  return (
    <section
      className={`wf wf_${state}`}
      aria-label={title}
    >
      <header className={'wf__head' + (interactive ? ' wf__head_draggable' : '')} {...(interactive ? api.dragProps : {})}>
        {interactive && (
          <button
            type="button"
            className="wf__grip"
            aria-label={`Переместить виджет «${title}». Стрелки — переместить, Shift и стрелки — изменить размер`}
            title="Перетащите за шапку. Стрелки — переместить, Shift + стрелки — изменить размер"
            {...api.keyProps}
          >
            <GripIcon />
          </button>
        )}
        <h3 className="wf__title">{title}</h3>
        <button
          type="button"
          className="wf__close"
          data-no-drag
          aria-label={`Скрыть виджет «${title}»`}
          title="Скрыть виджет"
          onClick={onRemove}
        >
          <CloseIcon />
        </button>
      </header>
      <div className="wf__body">{children}</div>
      {interactive && <div className="wf__resize" aria-hidden {...api.resizeProps} />}
    </section>
  );
}
