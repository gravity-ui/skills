import { useLayoutEffect, useRef, useState } from 'react';

/** Tracks an element's content-box size. Charts re-layout when their widget is resized. */
export function useSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = (width: number, height: number) =>
            setSize((s) =>
                s.width === Math.round(width) && s.height === Math.round(height)
                    ? s
                    : { width: Math.round(width), height: Math.round(height) },
            );
        const rect = el.getBoundingClientRect();
        update(rect.width, rect.height);
        const ro = new ResizeObserver(([entry]) =>
            update(entry.contentRect.width, entry.contentRect.height),
        );
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return [ref, size] as const;
}
