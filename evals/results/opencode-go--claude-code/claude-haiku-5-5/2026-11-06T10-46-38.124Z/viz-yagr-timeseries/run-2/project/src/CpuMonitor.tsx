import { useEffect, useState } from 'react';
import { useThemeType } from '@gravity-ui/uikit';

import { CpuChart, type ChartTheme } from './CpuChart';
import { createSimulatedCpuFeed, type CpuFeed } from './cpuFeed';
import { hourlyRows, summarize } from './cpuStats';
import './CpuMonitor.css';

const percent = (value: number) => `${value.toFixed(1)}%`;
const hourLabel = (t: number) =>
  new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

/**
 * Значение, пересчитываемое на каждом замере. Подписка живёт в компоненте, который
 * его использует, поэтому обновления не поднимаются до всей страницы.
 */
function useFeedValue<T>(feed: CpuFeed, read: (feed: CpuFeed) => T): T {
  const [value, setValue] = useState(() => read(feed));
  useEffect(() => feed.subscribe(() => setValue(read(feed))), [feed, read]);
  return value;
}

const readSummary = (feed: CpuFeed) => summarize(feed.values);
const readHours = (feed: CpuFeed) => hourlyRows(feed.timeline, feed.values);

function CpuStats({ feed }: { feed: CpuFeed }) {
  const summary = useFeedValue(feed, readSummary);
  if (!summary) {
    return null;
  }
  return (
    <dl className="cpu-stats">
      <div>
        <dt>Сейчас</dt>
        <dd>{percent(summary.current)}</dd>
      </div>
      <div>
        <dt>Среднее за 24 ч</dt>
        <dd>{percent(summary.average)}</dd>
      </div>
      <div>
        <dt>Пик за 24 ч</dt>
        <dd>{percent(summary.peak)}</dd>
      </div>
    </dl>
  );
}

/** Табличный двойник графика: значения доступны без наведения и для скринридеров. */
function CpuHourlyTable({ feed }: { feed: CpuFeed }) {
  const rows = useFeedValue(feed, readHours);
  return (
    <details className="cpu-details">
      <summary>Таблица по часам</summary>
      <table className="cpu-table">
        <thead>
          <tr>
            <th scope="col">Час</th>
            <th scope="col">Среднее</th>
            <th scope="col">Пик</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.hourStart}>
              <td>{hourLabel(row.hourStart)}</td>
              <td>{percent(row.average)}</td>
              <td>{percent(row.peak)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function CpuMonitor() {
  // Фид создаётся один раз. Опрос идёт, пока смонтирована страница.
  const [feed] = useState(() => createSimulatedCpuFeed());
  const theme: ChartTheme = useThemeType();

  useEffect(() => {
    feed.start();
    return () => feed.stop();
  }, [feed]);

  return (
    <div className="cpu-page">
      <section className="cpu-panel" data-theme={theme}>
        <header className="cpu-header">
          <h1 className="cpu-title">Загрузка CPU за последние сутки</h1>
          <CpuStats feed={feed} />
        </header>
        <CpuChart feed={feed} theme={theme} />
        <CpuHourlyTable feed={feed} />
      </section>
    </div>
  );
}
