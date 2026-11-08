import {useMemo} from 'react';
import {BarChart} from '../charts/BarChart';
import {LineChart} from '../charts/LineChart';
import {SegmentedBar} from '../charts/SegmentedBar';
import {TableView} from '../charts/TableView';
import {
  categorySales,
  channelShares,
  dailySeries,
  dateLabels,
  fmtMoney,
  previousSeries,
} from '../dashboard/data';

interface WidgetProps {
  days: number;
  view: 'chart' | 'table';
}

export function LineWidget({days, view}: WidgetProps) {
  const labels = useMemo(() => dateLabels(days), [days]);
  const current = useMemo(() => dailySeries('revenue', days), [days]);
  const previous = useMemo(() => previousSeries('revenue', days), [days]);

  if (view === 'table') {
    return (
      <TableView
        ariaLabel="Выручка по дням: текущий и предыдущий период"
        columns={[
          {key: 'date', title: 'Дата'},
          {key: 'cur', title: 'Текущий период', numeric: true},
          {key: 'prev', title: 'Предыдущий период', numeric: true},
        ]}
        rows={labels.map((l, i) => [l, fmtMoney(current[i]), fmtMoney(previous[i])])}
      />
    );
  }
  return (
    <LineChart
      xLabels={labels}
      formatValue={fmtMoney}
      ariaLabel="Линейный график выручки: текущий период против предыдущего"
      series={[
        {name: 'Текущий период', color: 'var(--s1)', values: current, area: true},
        {name: 'Предыдущий период', color: 'var(--s2)', values: previous},
      ]}
    />
  );
}

export function BarWidget({days, view}: WidgetProps) {
  const data = useMemo(() => categorySales(days), [days]);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (view === 'table') {
    return (
      <TableView
        ariaLabel="Выручка по категориям"
        columns={[
          {key: 'cat', title: 'Категория'},
          {key: 'rev', title: 'Выручка', numeric: true},
          {key: 'share', title: 'Доля', numeric: true},
        ]}
        rows={data.map((d) => [
          d.name,
          fmtMoney(d.value),
          `${Math.round((d.value / total) * 100)} %`,
        ])}
      />
    );
  }
  return (
    <BarChart
      data={data}
      color="var(--s1)"
      formatValue={fmtMoney}
      ariaLabel="Столбчатая диаграмма выручки по категориям"
    />
  );
}

const SEGMENT_COLORS = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
const SEGMENT_ON_COLORS = ['var(--on-s1)', 'var(--on-s2)', 'var(--on-s3)', 'var(--on-s4)'];

export function MixWidget({days, view}: WidgetProps) {
  const parts = useMemo(() => channelShares(days), [days]);

  if (view === 'table') {
    return (
      <TableView
        ariaLabel="Структура выручки по каналам"
        columns={[
          {key: 'ch', title: 'Канал'},
          {key: 'sum', title: 'Выручка', numeric: true},
          {key: 'share', title: 'Доля', numeric: true},
        ]}
        rows={parts.map((p) => [p.name, fmtMoney(p.value), `${Math.round(p.share * 100)} %`])}
      />
    );
  }
  return (
    <SegmentedBar
      ariaLabel="Структура выручки по каналам продаж"
      formatValue={fmtMoney}
      parts={parts.map((p, i) => ({
        name: p.name,
        share: p.share,
        value: p.value,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        onColor: SEGMENT_ON_COLORS[i % SEGMENT_ON_COLORS.length],
      }))}
    />
  );
}
