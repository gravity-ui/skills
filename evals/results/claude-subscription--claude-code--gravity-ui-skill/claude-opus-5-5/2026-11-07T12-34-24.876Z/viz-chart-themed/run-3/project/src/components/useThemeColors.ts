import {useEffect, useState, type RefObject} from 'react';
import {useThemeValue} from '@gravity-ui/uikit';

/**
 * Resolves semantic `--g-*` CSS tokens to concrete color values for the theme
 * currently applied to `ref.current`.
 *
 * Chart series colors are written into SVG attributes and processed by the
 * chart (hover/legend), so they need real values rather than `var(...)`.
 * Re-resolves whenever the uikit theme changes. `useEffect` (not layout effect)
 * is intentional: ThemeProvider updates the theme class in its own layout
 * effect, which runs after children's layout effects.
 */
export function useThemeColors(
    ref: RefObject<HTMLElement>,
    tokens: readonly string[],
): string[] | null {
    const theme = useThemeValue();
    const [colors, setColors] = useState<string[] | null>(null);
    const key = tokens.join('|');

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const style = getComputedStyle(element);
        setColors(tokens.map((token) => style.getPropertyValue(token).trim()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, theme, key]);

    return colors;
}
