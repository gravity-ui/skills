import {formatValue, lastValue} from './format';
import type {EngineSeries} from './types';

interface SeriesLegendProps {
  series: EngineSeries[];
  unit?: string;
}

/**
 * Легенда общая для обоих режимов. Идентичность серии передают текстовые подписи
 * и цветная метка, а не только цвет. Последнее значение — видимая подпись, которая
 * компенсирует контраст светлых слотов палитры (см. palette.ts).
 */
export function SeriesLegend({series, unit}: SeriesLegendProps) {
  return (
    <ul className="cw-legend">
      {series.map((s) => {
        const last = lastValue(s.points);
        return (
          <li key={s.id} className="cw-legend__item">
            <span className="cw-legend__swatch" style={{backgroundColor: s.color}} aria-hidden="true" />
            <span className="cw-legend__name">{s.name}</span>
            <span className="cw-legend__value">
              {last === null ? '—' : formatValue(last, unit)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
