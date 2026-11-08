import { Grip } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import * as React from 'react';

import type { DropSide } from './utils';

export interface ColumnDndApi {
  /** Column currently being dragged (HTML5 DnD). */
  dragId: string | null;
  /** Column the pointer is over and on which side the dragged column will land. */
  over: { id: string; side: DropSide } | null;
  startDrag: (id: string) => void;
  endDrag: () => void;
  /** Keyboard alternative to drag & drop. */
  shift: (id: string, direction: -1 | 1) => void;
}

export const ColumnDndContext = React.createContext<ColumnDndApi | null>(null);

interface ColumnHeaderProps {
  id: string;
  title: string;
  align?: 'start' | 'end';
}

/**
 * Draggable table header. `dragover`/`drop` are handled by the table container
 * (event delegation), so the whole `<th>` works as a drop zone, not just this element.
 */
export function ColumnHeader({ id, title, align = 'start' }: ColumnHeaderProps) {
  const dnd = React.useContext(ColumnDndContext);
  if (!dnd) {
    throw new Error('ColumnHeader must be rendered inside ColumnDndContext');
  }

  const dragging = dnd.dragId === id;
  const overSide = dnd.over?.id === id ? dnd.over.side : null;
  const className = [
    'column-header',
    `column-header_align_${align}`,
    dragging ? 'column-header_dragging' : '',
    overSide ? `column-header_over_${overSide}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.altKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      dnd.shift(id, event.key === 'ArrowLeft' ? -1 : 1);
    }
  };

  return (
    <div
      className={className}
      data-column-id={id}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`${title}: переместить колонку`}
      aria-roledescription="перетаскиваемый заголовок колонки"
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
      title="Перетащите, чтобы изменить порядок колонок. Alt + ← / → — переместить с клавиатуры"
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        dnd.startDrag(id);
      }}
      onDragEnd={dnd.endDrag}
      onKeyDown={handleKeyDown}
    >
      <Icon data={Grip} size={12} className="column-header__grip" />
      <span className="column-header__title">{title}</span>
    </div>
  );
}
