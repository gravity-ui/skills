import * as React from 'react';

export interface Size {
  width: number;
  height: number;
}

/** Размер элемента через ResizeObserver; обновляется при ресайзе виджета. */
export function useElementSize<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5
          ? prev
          : { width: rect.width, height: rect.height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
