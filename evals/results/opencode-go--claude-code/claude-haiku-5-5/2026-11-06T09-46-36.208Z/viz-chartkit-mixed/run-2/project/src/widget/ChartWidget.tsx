import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {Button, Card, SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {ChartEngine, EngineInput, EngineModule} from './engine';
import {loadEngine} from './loadEngine';
import {formatValueDefault} from './format';
import {capSeries} from './math';
import {CATEGORICAL_LIGHT} from './palette';
import {DataTable} from './DataTable';
import type {ChartMode, ChartWidgetProps} from './types';
import './ChartWidget.css';

const MODE_OPTIONS: {value: ChartMode; content: string}[] = [
  {value: 'sales', content: 'Продажи'},
  {value: 'monitoring', content: 'Мониторинг'},
];

export function ChartWidget({
  title,
  series,
  mode: modeProp,
  defaultMode = 'sales',
  onModeChange,
  height = 320,
  formatValue = formatValueDefault,
}: ChartWidgetProps) {
  const [internalMode, setInternalMode] = useState<ChartMode>(defaultMode);
  const mode = modeProp ?? internalMode;
  const [showTable, setShowTable] = useState(false);
  const groupName = useId();

  const setMode = (next: ChartMode) => {
    if (modeProp === undefined) setInternalMode(next);
    onModeChange?.(next);
  };

  // Цвет серии задаётся её позицией в `series` и не меняется при смене режима.
  const {shown, hidden} = useMemo(() => capSeries(series, CATEGORICAL_LIGHT.length), [series]);
  const colors = useMemo(() => CATEGORICAL_LIGHT.slice(0, shown.length), [shown.length]);

  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0].contentRect.width));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const input = useMemo<EngineInput>(
    () => ({series: shown, colors, width, height, formatValue}),
    [shown, colors, width, height, formatValue],
  );
  const inputRef = useRef(input);
  inputRef.current = input;

  // Ленивая загрузка движка текущего режима.
  const [loaded, setLoaded] = useState<{mode: ChartMode; mod: EngineModule} | null>(null);
  const [failed, setFailed] = useState<{mode: ChartMode; message: string} | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadEngine(mode).then(
      (mod) => {
        if (cancelled) return;
        setLoaded({mode, mod});
        setFailed(null);
      },
      (error: unknown) => {
        if (cancelled) return;
        setFailed({mode, message: error instanceof Error ? error.message : String(error)});
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const engineRef = useRef<{mode: ChartMode; mod: EngineModule; engine: ChartEngine} | null>(null);

  // Создаём или заменяем движок, когда модуль текущего режима готов. Пока он грузится,
  // предыдущий график остаётся на месте (приглушён), без мигания и скачка верстки.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !loaded || loaded.mode !== mode || width <= 0) return;
    const current = engineRef.current;
    if (current && current.mode === mode && current.mod === loaded.mod) return;
    current?.engine.destroy();
    host.replaceChildren();
    engineRef.current = {mode, mod: loaded.mod, engine: loaded.mod.createEngine(host, inputRef.current)};
  }, [mode, loaded, width]);

  // Данные, размер и формат передаются в живой движок того же режима.
  useEffect(() => {
    const current = engineRef.current;
    if (current && current.mode === mode) current.engine.update(input);
  }, [input, mode]);

  useEffect(
    () => () => {
      engineRef.current?.engine.destroy();
      engineRef.current = null;
    },
    [],
  );

  const errorMessage = failed?.mode === mode ? failed.message : null;
  const busy = errorMessage === null && loaded?.mode !== mode;

  return (
    <Card view="outlined" type="container" size="l" className="viz-widget">
      <div className="viz-widget__header">
        <h2 className="viz-widget__title">{title}</h2>
        <SegmentedRadioGroup<ChartMode>
          name={groupName}
          aria-label="Режим графика"
          value={mode}
          options={MODE_OPTIONS}
          onUpdate={setMode}
          size="m"
        />
      </div>

      <div className="viz-host" ref={hostRef} style={{height}} aria-busy={busy || undefined} />

      {busy && <p className="viz-note" role="status">Загружаем движок графика…</p>}
      {errorMessage !== null && (
        <p className="viz-note" role="alert">
          Не удалось загрузить движок графика ({errorMessage}). Данные доступны в таблице.
        </p>
      )}

      {shown.length >= 2 && (
        <ul className="viz-legend" aria-label="Серии">
          {shown.map((s, i) => (
            <li key={s.id}>
              <span className="viz-legend__key" style={{background: colors[i]}} aria-hidden="true" />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {hidden.length > 0 && (
        <p className="viz-note">
          Показано {shown.length} из {series.length} серий: палитра не расширяется, остальные скрыты.
        </p>
      )}

      <div className="viz-widget__footer">
        <Button
          view="flat"
          size="s"
          aria-expanded={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'Скрыть таблицу' : 'Показать таблицу'}
        </Button>
      </div>

      {showTable && <DataTable series={shown} formatValue={formatValue} />}
    </Card>
  );
}
