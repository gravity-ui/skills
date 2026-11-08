import { useLayoutEffect, useState, type RefObject } from 'react';

/** Размер элемента в пикселях; обновляется при ресайзе (в т.ч. при изменении размера виджета). */
export function useElementSize<T extends HTMLElement | SVGElement>(ref: RefObject<T>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}
