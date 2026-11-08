import React from 'react';
import { incidents, type Severity } from '../data';
import { fmtDateShort } from '../format';
import { StatusIcon } from '../icons';

export const STATUS_LABEL: Record<Severity, string> = {
  good: 'Решён',
  warning: 'Наблюдение',
  serious: 'Деградация',
  critical: 'Авария',
};

export function Incidents({ days, width }: { days: number; width: number }) {
  const rows = incidents(days);
  const showService = width >= 480;
  return (
    <div className="scroll" tabIndex={0} role="region" aria-label="Последние события">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Когда</th>
            {showService && <th scope="col">Сервис</th>}
            <th scope="col">Событие</th>
            <th scope="col">Статус</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.title}>
              <td className="nowrap">{r.daysAgo === 0 ? 'Сегодня' : fmtDateShort(r.date)}</td>
              {showService && <td className="nowrap">{r.service}</td>}
              <td>{r.title}</td>
              <td className="nowrap">
                <span className={`status status_${r.status}`}>
                  <StatusIcon kind={r.status} />
                  <span className="status__text">{STATUS_LABEL[r.status]}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
