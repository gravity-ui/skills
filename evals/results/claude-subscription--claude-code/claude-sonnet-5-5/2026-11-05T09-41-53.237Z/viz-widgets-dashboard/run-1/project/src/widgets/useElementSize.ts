import { useLayoutEffect, useRef, useState } from 'react';

/** Tracks the content box of an element, so SVG charts can fill their widget. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (w: number, h: number) =>
      setSize((s) => (s.width === w && s.height === h ? s : { width: w, height: h }));
    update(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(([entry]) =>
      update(Math.floor(entry.contentRect.width), Math.floor(entry.contentRect.height)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
}
