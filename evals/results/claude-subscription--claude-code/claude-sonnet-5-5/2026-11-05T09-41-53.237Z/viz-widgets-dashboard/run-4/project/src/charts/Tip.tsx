import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Тултип в портале: у виджетов есть transform, а он ломает position: fixed у потомков.
 * Позиция — в координатах окна; у краёв экрана тултип разворачивается.
 */
export function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    const left = x + 14 + w > window.innerWidth - 8 ? x - 14 - w : x + 14;
    const top = Math.min(Math.max(8, y - h / 2), window.innerHeight - h - 8);
    el.style.transform = `translate(${Math.max(8, left)}px, ${top}px)`;
  });
  return createPortal(
    <div ref={ref} className="tip" role="tooltip">
      {children}
    </div>,
    document.body,
  );
}

export function TipRow({ color, name, value }: { color?: string; name: string; value: string }) {
  return (
    <div className="tip__row">
      {color && <span className="tip__key" style={{ background: color }} />}
      <span className="tip__value">{value}</span>
      <span className="tip__name">{name}</span>
    </div>
  );
}
