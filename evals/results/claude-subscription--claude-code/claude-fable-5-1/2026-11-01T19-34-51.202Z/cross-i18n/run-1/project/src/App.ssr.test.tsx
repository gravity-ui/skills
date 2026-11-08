import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {App} from './App';
import {I18nProvider} from './i18n/I18nProvider';
import {LanguageSwitcher} from './components/LanguageSwitcher';

describe('App rendering', () => {
  it('renders in English by default (no browser language)', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Language switcher demo');
    expect(html).toContain('Previous'); // built-in Gravity UI Pagination text
    expect(html).not.toContain('Демо переключения языка');
  });

  it('renders in Russian when the language is ru', () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLang="ru">
        <LanguageSwitcher />
      </I18nProvider>,
    );
    expect(html).toContain('aria-label="Язык интерфейса"');
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="ru"/);
  });
});
