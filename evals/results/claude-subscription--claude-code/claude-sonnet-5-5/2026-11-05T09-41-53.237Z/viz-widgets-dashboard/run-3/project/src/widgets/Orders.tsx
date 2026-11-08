import React from 'react';
import { Label } from '@gravity-ui/uikit';
import { RECENT_ORDERS, type Order } from '../data';
import { rub } from '../format';

const STATUS: Record<Order['status'], { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  paid: { text: 'Оплачен', theme: 'success' },
  pending: { text: 'Ожидает', theme: 'warning' },
  refunded: { text: 'Возврат', theme: 'danger' },
};

export function Orders() {
  return (
    <div className="orders">
      <table className="orders__table">
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">Клиент</th>
            <th scope="col" className="orders__channel">Канал</th>
            <th scope="col" className="orders__num">Сумма</th>
            <th scope="col">Статус</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_ORDERS.map((o) => (
            <tr key={o.id}>
              <td className="orders__id">{o.id}</td>
              <td>{o.customer}</td>
              <td className="orders__channel">{o.channel}</td>
              <td className="orders__num">{rub(o.amount)}</td>
              <td>
                <Label theme={STATUS[o.status].theme} size="xs">
                  {STATUS[o.status].text}
                </Label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
