import '@gravity-ui/page-constructor/styles/styles.scss';
import './App.css';

import { PageConstructor, PageConstructorProvider, Theme } from '@gravity-ui/page-constructor';
import { useThemeType } from '@gravity-ui/uikit';

import { content } from './content';

export function App() {
  // Keep page-constructor in sync with the uikit ThemeProvider wired in main.tsx.
  const theme = useThemeType();

  return (
    <PageConstructorProvider theme={theme === 'dark' ? Theme.Dark : Theme.Light}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
