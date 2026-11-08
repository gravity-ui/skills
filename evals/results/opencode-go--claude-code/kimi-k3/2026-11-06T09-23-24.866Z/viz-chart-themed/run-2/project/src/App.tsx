import {Card, Text} from '@gravity-ui/uikit';

import {LineChart} from './LineChart';

// Monthly revenue, ₽M — change-over-time data, so a single line.
const REVENUE = [
  {label: 'Янв', value: 124},
  {label: 'Фев', value: 156},
  {label: 'Мар', value: 143},
  {label: 'Апр', value: 178},
  {label: 'Май', value: 190},
  {label: 'Июн', value: 171},
  {label: 'Июл', value: 210},
  {label: 'Авг', value: 235},
  {label: 'Сен', value: 224},
  {label: 'Окт', value: 260},
  {label: 'Ноя', value: 248},
  {label: 'Дек', value: 289},
];

const formatValue = (v: number) => `${v} млн ₽`;

export function App() {
  return (
    <div style={{maxWidth: 860, margin: '0 auto', padding: 24}}>
      <Card style={{padding: 24}}>
        {/* Single series → the title names it, no legend box needed. */}
        <Text variant="header-1" as="div">
          Выручка по месяцам
        </Text>
        <Text variant="body-2" color="secondary" as="div" style={{marginTop: 4, marginBottom: 16}}>
          2025 год · все цвета графика берутся из токенов текущей темы Gravity UI
        </Text>

        <LineChart data={REVENUE} formatValue={formatValue} formatTick={(v) => String(v)} />

        {/* Accessible table view of the same data. */}
        <details style={{marginTop: 16}}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--g-color-text-secondary)',
            }}
          >
            Показать данные таблицей
          </summary>
          <table
            style={{
              marginTop: 8,
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
              color: 'var(--g-color-text-primary)',
            }}
          >
            <thead>
              <tr>
                {REVENUE.map((d) => (
                  <th
                    key={d.label}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid var(--g-color-line-generic)',
                      color: 'var(--g-color-text-secondary)',
                      fontWeight: 500,
                      textAlign: 'right',
                    }}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {REVENUE.map((d) => (
                  <td
                    key={d.label}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid var(--g-color-line-generic)',
                      textAlign: 'right',
                    }}
                  >
                    {d.value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </details>
      </Card>
    </div>
  );
}
