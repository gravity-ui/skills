import React from 'react';

export interface TipRow {
  /** Цвет ключа-штриха; без него — без ключа. */
  color?: string;
  dashed?: boolean;
  value: string;
  label: string;
}

interface Props {
  x: number;
  y: number;
  /** 'above' — по центру над точкой; 'right' / 'left' — сбоку. */
  placement: 'above' | 'right' | 'left';
  title: string;
  rows: TipRow[];
}

/** Тултип поверх виджета. Значение — главное, подпись — вторичная. Тексты только через React (экранируются). */
export function Tip({ x, y, placement, title, rows }: Props) {
  return (
    <div className={`tip tip_${placement}`} style={{ left: x, top: y }} role="status">
      <div className="tip__title">{title}</div>
      {rows.map((r, i) => (
        <div className="tip__row" key={i}>
          {r.color && (
            <svg className="tip__key" width="14" height="4" aria-hidden>
              <line x1="0" x2="14" y1="2" y2="2" stroke={r.color} strokeWidth="2" strokeDasharray={r.dashed ? '4 3' : undefined} strokeLinecap="round" />
            </svg>
          )}
          <span className="tip__value">{r.value}</span>
          <span className="tip__label">{r.label}</span>
        </div>
      ))}
    </div>
  );
}
