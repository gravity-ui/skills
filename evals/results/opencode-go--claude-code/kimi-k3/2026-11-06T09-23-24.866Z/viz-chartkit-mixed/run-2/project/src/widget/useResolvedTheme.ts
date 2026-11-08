import {useEffect, useState} from 'react';

import type {ThemeMode} from './colors';

function detectTheme(): ThemeMode {
  const root = document.documentElement;
  const body = document.body;
  const has = (cls: string) => root.classList.contains(cls) || (body?.classList.contains(cls) ?? false);

  // Тёмная/светлая тема, явно выставленная приложением (Gravity UI или data-theme), побеждает OS.
  if (has('g-root_theme_dark') || root.dataset.theme === 'dark') return 'dark';
  if (has('g-root_theme_light') || root.dataset.theme === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Отслеживает текущую тему: смена класса темы на <html>/<body> (переключатель темы
 * приложения) и системная prefers-color-scheme.
 */
export function useResolvedTheme(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>(detectTheme);

  useEffect(() => {
    const update = () => setTheme(detectTheme());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', update);

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    if (document.body) {
      observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
    }

    update();
    return () => {
      mq.removeEventListener('change', update);
      observer.disconnect();
    };
  }, []);

  return theme;
}
