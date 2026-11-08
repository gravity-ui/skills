export interface TooltipRow {
  color: string;
  name: string;
  value: string;
}

/**
 * Общая подсказка для обоих движков. Значения вставляются через textContent:
 * имена серий приходят извне и не должны попадать в DOM как HTML.
 */
export function createTooltip(): HTMLDivElement {
  const tip = document.createElement('div');
  tip.className = 'viz-tooltip';
  tip.hidden = true;
  return tip;
}

export function fillTooltip(tip: HTMLElement, title: string, rows: readonly TooltipRow[]): void {
  tip.replaceChildren();

  const head = document.createElement('div');
  head.className = 'viz-tooltip__time';
  head.textContent = title;
  tip.append(head);

  for (const r of rows) {
    const row = document.createElement('div');
    row.className = 'viz-tooltip__row';

    const key = document.createElement('span');
    key.className = 'viz-tooltip__key';
    key.style.background = r.color;

    const name = document.createElement('span');
    name.className = 'viz-tooltip__name';
    name.textContent = r.name;

    const value = document.createElement('span');
    value.className = 'viz-tooltip__value';
    value.textContent = r.value;

    row.append(key, name, value);
    tip.append(row);
  }
}

/** Ставит подсказку справа от курсора, а у правого края — слева. */
export function placeTooltip(tip: HTMLElement, anchorX: number, top: number, containerWidth: number): void {
  const gap = 12;
  const w = tip.offsetWidth;
  const flip = anchorX + gap + w > containerWidth;
  const left = flip ? anchorX - gap - w : anchorX + gap;
  tip.style.left = `${Math.max(0, left)}px`;
  tip.style.top = `${top}px`;
}
