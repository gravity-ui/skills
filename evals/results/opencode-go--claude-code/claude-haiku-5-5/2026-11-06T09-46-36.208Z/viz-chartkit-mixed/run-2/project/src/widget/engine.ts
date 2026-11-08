import type {Series} from './types';

/** Всё, что движку нужно для отрисовки. Одинаково для обоих режимов. */
export interface EngineInput {
  /** Уже обрезан до размера палитры. */
  readonly series: readonly Series[];
  /** `colors[i]` принадлежит `series[i]`: цвет привязан к серии, а не к её месту в выдаче. */
  readonly colors: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly formatValue: (value: number) => string;
}

export interface ChartEngine {
  update(input: EngineInput): void;
  destroy(): void;
}

/** Контракт, которому должен соответствовать каждый ленивый модуль движка. */
export interface EngineModule {
  createEngine(host: HTMLElement, input: EngineInput): ChartEngine;
}
