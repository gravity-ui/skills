import { useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, Text } from '@gravity-ui/uikit';
import { GridLayout } from './grid/GridLayout';
import { appendItem, parseLayout, type GridItem, type Layout } from './grid/layout';
import { CloseIcon, GripIcon, PlusIcon, ResetIcon } from './icons';
import { COLS, DEFAULT_LAYOUT, WIDGET_BY_ID, WIDGETS } from './widgets/registry';
import './dashboard.css';

const STORAGE_KEY = 'dashboard-layout-v1';

function loadLayout(): Layout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const known = new Map<string, GridItem>(DEFAULT_LAYOUT.map((it) => [it.id, it]));
      const parsed = parseLayout(JSON.parse(raw), known, COLS);
      if (parsed) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage: fall back to the default layout.
  }
  return DEFAULT_LAYOUT;
}

export function App() {
  const [layout, setLayout] = useState<Layout>(loadLayout);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }))),
      );
    } catch {
      // Storage full / blocked: the layout just won't persist.
    }
  }, [layout]);

  const hidden = useMemo(
    () => WIDGETS.filter((w) => !layout.some((it) => it.id === w.id)),
    [layout],
  );

  const add = (id: string) => {
    const def = WIDGET_BY_ID.get(id);
    if (!def) return;
    const { x: _x, y: _y, ...size } = def.grid;
    setLayout((l) => appendItem(l, { id, ...size }, COLS));
  };

  return (
    <div className="dash">
      <header className="dash__header">
        <div>
          <Text variant="header-2" as="h1" className="dash__title">
            Обзор продаж
          </Text>
          <Text variant="body-1" color="secondary">
            Перетаскивайте виджеты за заголовок, меняйте размер за правый нижний угол.
          </Text>
        </div>
        <div className="dash__actions">
          <DropdownMenu
            items={hidden.map((w) => ({ text: w.title, action: () => add(w.id) }))}
            renderSwitcher={(props) => (
              <Button {...props} view="action" disabled={hidden.length === 0}>
                <Icon data={PlusIcon} size={16} />
                Добавить виджет
              </Button>
            )}
          />
          <Button view="outlined" onClick={() => setLayout(DEFAULT_LAYOUT)}>
            <Icon data={ResetIcon} size={16} />
            Сбросить
          </Button>
        </div>
      </header>

      {layout.length === 0 && (
        <div className="dash__empty">
          <Text variant="subheader-2">На дашборде пусто</Text>
          <Text color="secondary">Добавьте виджеты кнопкой выше.</Text>
        </div>
      )}

      <GridLayout
        layout={layout}
        onLayoutChange={setLayout}
        cols={COLS}
        labels={{
          move: 'перемещаемый виджет (стрелки — сдвинуть)',
          resize: 'Изменить размер (стрелки)',
        }}
        renderItem={({ item, dragHandleProps, isDragging }) => {
          const def = WIDGET_BY_ID.get(item.id)!;
          return (
            <section className={`card${isDragging ? ' card_dragging' : ''}`} aria-label={def.title}>
              <div className="card__header">
                <div className="card__handle" {...dragHandleProps} aria-label={`${def.title}: переместить`}>
                  <GripIcon width={16} height={16} className="card__grip" />
                  <Text variant="subheader-2" ellipsis>
                    {def.title}
                  </Text>
                </div>
                <Button
                  view="flat-secondary"
                  size="s"
                  aria-label={`Убрать виджет «${def.title}»`}
                  onClick={() => setLayout((l) => l.filter((it) => it.id !== item.id))}
                >
                  <Icon data={CloseIcon} size={14} />
                </Button>
              </div>
              <div className="card__body">{def.render()}</div>
            </section>
          );
        }}
      />
    </div>
  );
}
