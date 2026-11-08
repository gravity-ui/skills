import { Icon } from '@gravity-ui/uikit';
import CircleCheck from '@gravity-ui/icons/CircleCheck';
import CircleXmark from '@gravity-ui/icons/CircleXmark';
import TriangleExclamation from '@gravity-ui/icons/TriangleExclamation';
import type { Dataset } from '../data';
import { fmtInt } from '../format';
import { Frame } from './Frame';

// Status is never colour alone: icon + word travel with the colour.
function status(bounce: number) {
  if (bounce >= 55) return { key: 'critical', text: 'Высокий', icon: CircleXmark };
  if (bounce >= 40) return { key: 'warning', text: 'Повышенный', icon: TriangleExclamation };
  return { key: 'good', text: 'Норма', icon: CircleCheck };
}

export function PagesTable({ data }: { data: Dataset }) {
  const rows = [...data.pages].sort((a, b) => b.views - a.views);
  return (
    <Frame title="Популярные страницы" subtitle="Просмотры и доля отказов">
      <div className="widget__scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Страница</th>
              <th scope="col" className="num">Просмотры</th>
              <th scope="col" className="num">Отказы</th>
              <th scope="col">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = status(r.bounce);
              return (
                <tr key={r.path}>
                  <th scope="row" title={r.path}>{r.path}</th>
                  <td className="num">{fmtInt(r.views)}</td>
                  <td className="num">{r.bounce}%</td>
                  <td>
                    <span className="status">
                      <span className={`status__icon status__icon_${s.key}`}><Icon data={s.icon} size={16} /></span>
                      {s.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
