import '@gravity-ui/page-constructor/styles/styles.scss';
import './global.css';

import { PageConstructor, PageConstructorProvider, Theme } from '@gravity-ui/page-constructor';
import { useThemeValue } from '@gravity-ui/uikit';

import { landingContent } from './content';

export function App() {
  // Keep page-constructor's themed values in sync with the uikit ThemeProvider.
  const themeValue = useThemeValue();
  const theme = themeValue.startsWith('dark') ? Theme.Dark : Theme.Light;

  return (
    <PageConstructorProvider theme={theme}>
      <PageConstructor content={landingContent} />
    </PageConstructorProvider>
  );
}
