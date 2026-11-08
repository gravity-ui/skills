import * as React from 'react';
import { useThemeValue } from '@gravity-ui/uikit';

/**
 * Resolves Gravity UI `--g-*` CSS tokens to concrete color strings for the current theme.
 *
 * @gravity-ui/charts runs series colors through d3-color (hover highlight etc.), so it needs
 * real color values, not `var(--…)`. We read the tokens from an element inside the themed
 * root and re-read them whenever the uikit theme changes (light / dark / *-hc / system).
 *
 * `useEffect` (not `useLayoutEffect`) is intentional: the root `ThemeProvider` swaps the body
 * theme class in its own layout effect, which runs *after* children's layout effects. Passive
 * effects run after all layout effects, so the new theme's values are already applied here.
 */
export function useThemeTokenColors(
    ref: React.RefObject<HTMLElement>,
    tokens: readonly string[],
): string[] | undefined {
    const themeValue = useThemeValue();
    const [colors, setColors] = React.useState<string[]>();
    const tokensKey = tokens.join('|');

    React.useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const style = window.getComputedStyle(element);
        setColors(tokens.map((token) => style.getPropertyValue(token).trim()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, themeValue, tokensKey]);

    return colors;
}
