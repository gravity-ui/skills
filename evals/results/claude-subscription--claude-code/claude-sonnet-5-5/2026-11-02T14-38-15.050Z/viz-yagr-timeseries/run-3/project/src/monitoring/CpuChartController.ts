import Yagr, {type MinimalValidConfig, type RawSerieData, type YagrTheme} from '@gravity-ui/yagr';

import {getSeriesColors} from './cpuChartTheme';
import {HOUR_MS, MINUTE_MS, type CpuHistory} from './cpuSource';

const SERIES_ID = 'cpu';
const TOOLTIP_CLASS = 'cpu-chart-tooltip';

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const hm = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const hms = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
const dayMonth = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});

/**
 * Подписи оси X зависят от видимого диапазона: на сутках — «14:00» (и дата на
 * полуночи), при сильном приближении — с секундами.
 */
function formatTimeTicks(_u: unknown, splits: number[]): string[] {
  const range = splits.length > 1 ? splits[splits.length - 1] - splits[0] : 0;
  const withSeconds = range < 10 * MINUTE_MS;
  return splits.map((t) => {
    const date = new Date(t);
    const isMidnight = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
    if (isMidnight && range > 2 * HOUR_MS) return dayMonth.format(date);
    return (withSeconds ? hms : hm).format(date);
  });
}

/** uPlot держит cursor.left/top отрицательными, пока указатель вне области графика. */
function isPointerOverPlot(uplot: Yagr['uplot'] | undefined): boolean {
  const cursor = uplot?.cursor;
  return cursor != null && (cursor.left ?? -1) >= 0 && (cursor.top ?? -1) >= 0;
}

export interface CpuChartState {
  /** Пользователь приблизил участок графика. */
  zoomed: boolean;
  /** Обновления накапливаются, но не рисуются (курсор над графиком). */
  paused: boolean;
}

export interface CpuChartControllerOptions {
  theme: YagrTheme;
  /** Шаг между точками, мс. */
  stepMs: number;
  /** Ширина скользящего окна, мс. */
  windowMs: number;
  onStateChange?: (state: CpuChartState) => void;
  /** Вызывается при инициализации и после каждой отрисовки новых точек. */
  onLatest?: (point: {t: number; v: number}) => void;
}

/**
 * Императивное ядро графика. Владеет экземпляром Yagr (uPlot, canvas), буфером
 * входящих точек и всеми подписками, и гарантирует, что `dispose()` освобождает
 * всё это целиком. React-слой (CpuChart) лишь создаёт и уничтожает контроллер.
 *
 * Производительность:
 *  - данные хранятся в двух плоских массивах, обновление инкрементальное
 *    (append + срез головы окна) — без пересоздания uPlot;
 *  - входящие порции точек копятся в буфере и отрисовываются не чаще одного раза
 *    за кадр (requestAnimationFrame), а в фоновой вкладке — не рисуются вовсе;
 *  - пока курсор над графиком, отрисовка приостанавливается: tooltip и выделение
 *    не «уезжают» из-под руки, а накопленные точки применяются при уходе курсора.
 */
export class CpuChartController {
  private chart: Yagr | undefined;
  private readonly capacity: number;

  private pendingT: number[] = [];
  private pendingV: number[] = [];
  private lastT: number;
  private size: number;

  private rafId = 0;
  private hovering = false;
  private disposed = false;
  private applying = false;

  /** Приближенный диапазон по X (мс) или null, если показано всё окно. */
  private zoom: {min: number; max: number} | null = null;
  private state: CpuChartState = {zoomed: false, paused: false};

  constructor(
    private readonly root: HTMLElement,
    history: CpuHistory,
    private readonly options: CpuChartControllerOptions,
  ) {
    this.capacity = Math.max(1, Math.round(options.windowMs / options.stepMs));

    // Страховка от слишком длинной истории: график показывает ровно одно окно.
    const from = Math.max(0, history.timeline.length - this.capacity);
    const timeline = from ? history.timeline.slice(from) : history.timeline.slice();
    const values = from ? history.values.slice(from) : history.values.slice();
    this.size = timeline.length;
    this.lastT = timeline.length ? timeline[timeline.length - 1] : 0;

    this.chart = new Yagr(root, this.createConfig(timeline, values));

    root.addEventListener('pointerenter', this.onPointerEnter);
    root.addEventListener('pointerleave', this.onPointerLeave);

    this.emitLatest();
  }

  /** Принимает новые точки из потока. Копирует их в буфер и планирует отрисовку. */
  push(chunk: CpuHistory): void {
    if (this.disposed) return;
    const {timeline, values} = chunk;
    // Поток может повторить уже показанные точки (например, после переподключения).
    const lastKnown = this.pendingT.length
      ? this.pendingT[this.pendingT.length - 1]
      : this.lastT;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i] > lastKnown) {
        this.pendingT.push(timeline[i]);
        this.pendingV.push(values[i]);
      }
    }
    if (this.pendingT.length) this.schedule();
  }

  setTheme(theme: YagrTheme): void {
    const chart = this.chart;
    if (!chart || this.disposed) return;
    const {color, lineColor} = getSeriesColors(theme);
    chart.setTheme(theme);
    chart.setSeries(SERIES_ID, {color, lineColor} as Partial<RawSerieData>);
    // Цвета осей и сетки Yagr читает из CSS-переменных в момент отрисовки.
    chart.redraw(true, true);
  }

  resetZoom(): void {
    const uplot = this.chart?.uplot;
    if (!uplot || this.disposed) return;
    this.zoom = null;
    const {timeline} = this.chart!.config;
    this.applying = true;
    try {
      uplot.setScale('x', {min: timeline[0], max: timeline[timeline.length - 1]});
    } finally {
      this.applying = false;
    }
    this.setState({zoomed: false});
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    cancelAnimationFrame(this.rafId);
    this.root.removeEventListener('pointerenter', this.onPointerEnter);
    this.root.removeEventListener('pointerleave', this.onPointerLeave);
    this.pendingT = [];
    this.pendingV = [];

    // Yagr.dispose() снимает ResizeObserver, слушатели uPlot/tooltip, уничтожает canvas
    // и удаляет tooltip из document.body.
    this.chart?.dispose();
    this.chart = undefined;
  }

  // -------------------------------------------------------------------------

  private readonly onPointerEnter = () => {
    this.hovering = true;
    this.updatePaused();
  };

  private readonly onPointerLeave = () => {
    this.hovering = false;
    this.updatePaused();
    if (this.pendingT.length) this.schedule();
  };

  private updatePaused() {
    this.setState({paused: this.hovering && this.pendingT.length > 0});
  }

  private setState(patch: Partial<CpuChartState>) {
    const next = {...this.state, ...patch};
    if (next.zoomed === this.state.zoomed && next.paused === this.state.paused) return;
    this.state = next;
    this.options.onStateChange?.(next);
  }

  private schedule() {
    if (this.hovering) {
      this.updatePaused();
      return;
    }
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.flush();
    });
  }

  private flush() {
    const chart = this.chart;
    if (!chart || this.disposed || this.hovering || !this.pendingT.length) return;

    const timeline = this.pendingT;
    const values = this.pendingV;
    this.pendingT = [];
    this.pendingV = [];

    const added = timeline.length;
    const overflow = Math.max(0, this.size + added - this.capacity);

    this.applying = true;
    try {
      if (added >= this.capacity || (overflow > 0 && overflow !== added)) {
        // Редкий путь: окно заполнено не полностью или целиком заменяется.
        // Собираем новые массивы и пересоздаём график.
        const allT = chart.config.timeline.concat(timeline);
        const allV = (chart.config.series[0].data as number[]).concat(values);
        const from = Math.max(0, allT.length - this.capacity);
        chart.setSeries(allT.slice(from), [{id: SERIES_ID, data: allV.slice(from)}], {
          incremental: false,
        });
        this.size = allT.length - from;
      } else {
        // Обычный путь: дописываем точки в конец и (если окно полное) срезаем столько же с головы.
        chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {
          incremental: true,
          splice: overflow > 0,
        });
        this.size += added - overflow;
      }
      this.lastT = timeline[added - 1];
      this.restoreZoom();
    } finally {
      this.applying = false;
    }

    this.updatePaused();
    this.emitLatest();
  }

  /** setData сбрасывает масштаб X — возвращаем выбранный пользователем диапазон. */
  private restoreZoom() {
    const uplot = this.chart?.uplot;
    if (!uplot || !this.zoom) return;
    const first = this.chart!.config.timeline[0];
    if (this.zoom.max <= first) {
      // Приближенный участок целиком вышел за пределы окна.
      this.zoom = null;
      this.setState({zoomed: false});
      return;
    }
    this.zoom = {min: Math.max(this.zoom.min, first), max: this.zoom.max};
    uplot.setScale('x', this.zoom);
  }

  private emitLatest() {
    const chart = this.chart;
    if (!chart || !this.options.onLatest) return;
    const {timeline} = chart.config;
    const data = chart.config.series[0].data;
    const i = timeline.length - 1;
    if (i >= 0) this.options.onLatest({t: timeline[i], v: data[i] as number});
  }

  /** Хук uPlot: отслеживает, приблизил ли пользователь график (drag-выделение / двойной клик). */
  private readonly onSetScale = (u: {scales: Record<string, {min?: number | null; max?: number | null}>}, key: string) => {
    if (key !== 'x' || this.applying || this.disposed || !this.chart) return;
    const {min, max} = u.scales.x;
    const {timeline} = this.chart.config;
    if (min == null || max == null || !timeline.length) return;
    const zoomed = min > timeline[0] || max < timeline[timeline.length - 1];
    this.zoom = zoomed ? {min, max} : null;
    this.setState({zoomed});
  };

  private createConfig(timeline: number[], values: number[]): MinimalValidConfig {
    const {theme} = this.options;
    const {color, lineColor} = getSeriesColors(theme);

    return {
      timeline,
      series: [
        {
          id: SERIES_ID,
          name: 'CPU',
          type: 'area',
          data: values,
          color,
          lineColor,
          lineWidth: 2,
          // Цвет в tooltip/маркере — цвет линии, а не прозрачной заливки.
          legendColorKey: 'lineColor',
          precision: 1,
          snapToValues: 'closest',
          // Типы Yagr для RawSerieData не включают поля area-серии (lineColor, lineWidth),
          // хотя в рантайме они поддерживаются.
        } as RawSerieData,
      ],
      chart: {
        size: {adaptive: true, resizeDebounceMs: 60},
        appearance: {theme, locale: 'ru'},
        select: {zoom: true, minWidth: 8},
      },
      scales: {
        // Загрузка CPU — доля от 0 до 100%: фиксированная шкала не «дышит» при обновлениях.
        y: {min: 0, max: 100},
      },
      axes: {
        x: {values: formatTimeTicks},
        y: {
          splitsCount: 5,
          values: (_u: unknown, splits: number[]) => splits.map((v) => `${v}%`),
        },
      },
      legend: {show: false},
      cursor: {
        markersSize: 8,
        // Вертикальная линия-прицел: тонкая и нейтральная, цвет из токена темы.
        x: {visible: true, style: '1px solid var(--g-color-text-hint)'},
        y: {visible: false},
        // Та же причина, что и у tooltip: маркер не должен «залипать» на конце линии.
        hideMarkers: () => !isPointerOverPlot(this.chart?.uplot),
      },
      tooltip: {
        strategy: 'none',
        pinable: false,
        className: TOOLTIP_CLASS,
        highlight: false,
        // После setScale/setSize/setData uPlot повторно вызывает setCursor с прежним idx,
        // даже если курсор уже вне графика, и Yagr снова показывает tooltip у левого края.
        // Показываем его, только пока курсор действительно над областью графика.
        show: (y) => isPointerOverPlot(y.uplot),
        render: ({x, scales}) => {
          const row = scales[0]?.rows[0];
          if (!row || row.value === null) return '';
          // Значения — числа и метка времени из форматтера; пользовательских строк нет.
          const value = Number(row.originalValue ?? row.value);
          const time = timeFormatter.format(new Date(x));
          return (
            `<div class="${TOOLTIP_CLASS}__time">${time}</div>` +
            `<div class="${TOOLTIP_CLASS}__row">` +
            `<span class="${TOOLTIP_CLASS}__key" style="background:${row.color}"></span>` +
            `<span class="${TOOLTIP_CLASS}__value">${value.toFixed(1)}%</span>` +
            `<span class="${TOOLTIP_CLASS}__name">CPU</span>` +
            `</div>`
          );
        },
      },
      hooks: {
        setScale: [this.onSetScale],
      },
    } as MinimalValidConfig;
  }
}
