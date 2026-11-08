import { useEffect, useMemo, useState } from 'react';
import { Button, DropdownMenu, Icon, Select, Switch, Text } from '@gravity-ui/uikit';
import Pencil from '@gravity-ui/icons/Pencil';
import Check from '@gravity-ui/icons/Check';
import Plus from '@gravity-ui/icons/Plus';
import ArrowRotateLeft from '@gravity-ui/icons/ArrowRotateLeft';
import { buildDataset, RANGES, type Dataset, type RangeKey } from './dashboard/data';
import { Grid } from './dashboard/Grid';
import { addItem, compact, type Layout } from './dashboard/layout';
import { DEFAULT_LAYOUT, toItem, WIDGETS, widgetById } from './dashboard/registry';
import { usePersistentDashboard } from './dashboard/storage';
import './dashboard/dashboard.css';

const COLS = 12;
const NARROW = '(max-width: 719px)';

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

export function App() {
  const [{ layout, gravity }, setState] = usePersistentDashboard(COLS);
  const [editing, setEditing] = useState(false);
  const narrow = useMedia(NARROW);

  // One filter scopes every widget. While data "reloads" the old render stays, dimmed.
  const [range, setRange] = useState<RangeKey>('30');
  const [data, setData] = useState<Dataset>(() => buildDataset('30'));
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (data.range === range) return;
    setLoading(true);
    const t = setTimeout(() => {
      setData(buildDataset(range));
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [range, data.range]);

  const setLayout = (next: Layout) => setState((s) => ({ ...s, layout: next }));
  const hidden = useMemo(() => WIDGETS.filter((w) => !layout.some((i) => i.id === w.id)), [layout]);

  const add = (id: string) => {
    const def = widgetById(id);
    if (!def) return;
    setState((s) => {
      const next = addItem(s.layout, toItem(def), COLS);
      return { ...s, layout: s.gravity ? compact(next) : next };
    });
  };
  const remove = (id: string) => setState((s) => {
    const next = s.layout.filter((i) => i.id !== id);
    return { ...s, layout: s.gravity ? compact(next) : next };
  });

  const isEditing = editing && !narrow;

  return (
    <div className="dash">
      <header className="dash__bar">
        <Text as="h1" variant="header-1" className="dash__title">Обзор продукта</Text>
        <div className="dash__actions">
          {isEditing && (
            <>
              <DropdownMenu
                size="m"
                items={hidden.map((w) => ({ text: w.title, action: () => add(w.id) }))}
                renderSwitcher={(props) => (
                  <Button {...props} view="outlined" disabled={hidden.length === 0}>
                    <Icon data={Plus} size={16} />
                    Добавить виджет
                  </Button>
                )}
              />
              <Switch checked={gravity} onUpdate={(g) => setState((s) => ({ ...s, gravity: g, layout: g ? compact(s.layout) : s.layout }))} content="Прижимать вверх" />
              <Button view="flat" onClick={() => setState((s) => ({ ...s, layout: DEFAULT_LAYOUT }))}>
                <Icon data={ArrowRotateLeft} size={16} />
                Сбросить
              </Button>
            </>
          )}
          <Button
            view={isEditing ? 'action' : 'outlined'}
            disabled={narrow}
            title={narrow ? 'Редактирование доступно на широких экранах' : undefined}
            onClick={() => setEditing((e) => !e)}
          >
            <Icon data={isEditing ? Check : Pencil} size={16} />
            {isEditing ? 'Готово' : 'Настроить'}
          </Button>
        </div>
      </header>

      <div className="dash__filters">
        <Select
          size="m"
          width={260}
          label="Период"
          value={[range]}
          options={RANGES}
          onUpdate={(v) => setRange(v[0] as RangeKey)}
        />
      </div>

      {isEditing && (
        <p className="dash__hint">
          Перетаскивайте виджеты за любое место, тяните за правый нижний угол, чтобы изменить размер. С клавиатуры: стрелки — переместить, Shift + стрелки — размер.
        </p>
      )}

      <main className={loading ? 'dash__content dash__content_loading' : 'dash__content'} aria-busy={loading}>
        {layout.length === 0 ? (
          <div className="dash__empty">
            <Text color="secondary">На дашборде пока нет виджетов. Нажмите «Настроить» и добавьте нужные.</Text>
          </div>
        ) : null}
        <Grid
          layout={layout}
          onChange={setLayout}
          editing={isEditing}
          gravity={gravity}
          stacked={narrow}
          cols={COLS}
          labelOf={(id) => widgetById(id)?.title ?? id}
          onRemove={remove}
          renderItem={(item) => widgetById(item.id)?.render(data)}
        />
      </main>
    </div>
  );
}
