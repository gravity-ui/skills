import {useCallback, useEffect, useRef, useState} from 'react';
import type {ChartEngine, WidgetData} from '../data/types';

export type EngineName = 'line' | 'monitor';

const cache = new Map<EngineName, ChartEngine>();

/** Возвращает текущий движок и колбэк для смены без повторной загрузки. */
export function useEngine(name: EngineName) {
  const [engine, setEngine] = useState<ChartEngine | null>(() => cache.get(name) ?? null);
  const cur = useRef<EngineName>(name);

  const load = useCallback(async (n: EngineName) => {
    cur.current = n;
    if (cache.has(n)) {
      setEngine(cache.get(n)!);
      return;
    }
    // ленивый динамический импорт — только при первом использовании
    const mod = n === 'line'
      ? await import('./engines/line-engine')
      : await import('./engines/monitor-engine');
    cache.set(n, mod.default);
    if (cur.current === n) setEngine(mod.default);
  }, []);

  useEffect(() => {
    if (name !== cur.current || !engine) load(name);
  }, [name, load, engine]);

  return engine;
}

/** Удобная обёртка: биндит движок к SVG‑контейнеру. */
export function useEngineRender(
  engine: ChartEngine | null,
  data: WidgetData,
) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !engine) return;
    engine.destroy(svg);
    engine.render(svg, data);
    return () => engine.destroy(svg);
  }, [engine, data]);

  return svgRef;
}
