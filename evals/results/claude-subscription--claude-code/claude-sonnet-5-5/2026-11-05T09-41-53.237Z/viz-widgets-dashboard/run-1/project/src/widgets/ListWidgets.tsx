import { useState } from 'react';
import { Label } from '@gravity-ui/uikit';
import { CheckIcon, ClockIcon, CloseIcon, UndoIcon } from '../icons';
import { channels, fmtCompact, fmtInt, fmtRub, orders, type OrderStatus } from './data';

/* ---------- Ranked bars ---------- */

export function ChannelsWidget() {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const max = Math.max(...channels.map((c) => c.value));
  const total = channels.reduce((s, c) => s + c.value, 0);

  return (
    <div
      className="bars"
      onPointerLeave={() => setHover(null)}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        const row = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
        setHover(
          row ? { i: Number(row.dataset.i), x: e.clientX - box.left, y: e.clientY - box.top } : null,
        );
      }}
    >
      {channels.map((c, i) => (
        <div key={c.name} data-i={i} className={`bars__row${hover && hover.i !== i ? ' bars__row_dim' : ''}`}>
          <div className="bars__label" title={c.name}>
            {c.name}
          </div>
          <div className="bars__track">
            <div className="bars__bar" style={{ width: `${(c.value / max) * 100}%` }} />
          </div>
          <div className="bars__value">{fmtCompact.format(c.value)} ₽</div>
        </div>
      ))}
      {hover && (
        <div className="tooltip" style={{ left: hover.x + 12, top: hover.y + 12 }}>
          <div className="tooltip__title">{channels[hover.i].name}</div>
          <div className="tooltip__row">
            <span className="tooltip__name">Выручка</span>
            <b>{fmtRub.format(channels[hover.i].value)}</b>
          </div>
          <div className="tooltip__row">
            <span className="tooltip__name">Доля</span>
            <b>{Math.round((channels[hover.i].value / total) * 100)}%</b>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Table ---------- */

const STATUS: Record<OrderStatus, { text: string; theme: 'success' | 'warning' | 'info' | 'danger'; icon: JSX.Element }> = {
  paid: { text: 'Оплачен', theme: 'success', icon: <CheckIcon width={12} height={12} /> },
  pending: { text: 'Ожидает', theme: 'warning', icon: <ClockIcon width={12} height={12} /> },
  refunded: { text: 'Возврат', theme: 'info', icon: <UndoIcon width={12} height={12} /> },
  failed: { text: 'Ошибка', theme: 'danger', icon: <CloseIcon width={12} height={12} /> },
};

export function OrdersTableWidget() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Заказ</th>
            <th>Клиент</th>
            <th className="num">Сумма</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const s = STATUS[o.status];
            return (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td className="num">{fmtInt.format(o.amount)} ₽</td>
                <td>
                  <Label theme={s.theme} icon={s.icon} size="s">
                    {s.text}
                  </Label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
