import type { ReactNode } from 'react';
import { Button, Icon } from '@gravity-ui/uikit';
import ChartLine from '@gravity-ui/icons/ChartLine';
import ListUl from '@gravity-ui/icons/ListUl';

export type View = 'chart' | 'table';

/** Common widget card: title row (+ optional chart/table switch) and a flexible body. */
export function Frame({
  title,
  subtitle,
  view,
  onViewChange,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  view?: View;
  onViewChange?: (v: View) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`widget${className ? ` ${className}` : ''}`} aria-label={title}>
      <header className="widget__head">
        <div className="widget__titles">
          <h2 className="widget__title">{title}</h2>
          {subtitle && <div className="widget__subtitle">{subtitle}</div>}
        </div>
        {view && onViewChange && (
          <Button
            view="flat"
            size="s"
            aria-pressed={view === 'table'}
            aria-label={view === 'chart' ? 'Показать таблицей' : 'Показать графиком'}
            title={view === 'chart' ? 'Показать таблицей' : 'Показать графиком'}
            onClick={() => onViewChange(view === 'chart' ? 'table' : 'chart')}
          >
            <Icon data={view === 'chart' ? ListUl : ChartLine} size={16} />
          </Button>
        )}
      </header>
      <div className="widget__body">{children}</div>
    </section>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="widget__scroll">
      <table className="data-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={i > 0 ? 'num' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} className="num">{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
