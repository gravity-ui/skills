import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface Anchor {
  x: number; // viewport coordinates
  y: number;
}

/**
 * Floating readout. Rendered in a portal so widget overflow / transforms never clip it,
 * flipped to stay inside the viewport. Content is React children (text nodes only for data).
 */
export function ChartTooltip({ anchor, children }: { anchor: Anchor | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!anchor || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    const gap = 14;
    let left = anchor.x + gap;
    if (left + width > window.innerWidth - 8) left = anchor.x - gap - width;
    let top = anchor.y - height - gap;
    if (top < 8) top = anchor.y + gap;
    setPos({ left: Math.max(8, left), top });
  }, [anchor, children]);

  if (!anchor) return null;
  return createPortal(
    <div ref={ref} className="viz-tooltip" role="status" style={{ left: pos.left, top: pos.top }}>
      {children}
    </div>,
    document.body,
  );
}
