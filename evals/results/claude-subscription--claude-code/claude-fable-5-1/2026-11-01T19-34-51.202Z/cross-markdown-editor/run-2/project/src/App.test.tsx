import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';
import { describe, expect, it } from 'vitest';

import { App } from './App';
import { MarkdownField } from './MarkdownField';

describe('App', () => {
  it('рендерит форму с полем markdown и живым предпросмотром', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <App />
      </ThemeProvider>,
    );
    expect(html).toContain('<form');
    expect(html).toContain('id="task-description"');
    expect(html).toContain('<textarea');
    expect(html).toContain('id="task-description-preview"');
    // начальный текст уже отформатирован в предпросмотре
    expect(html).toContain('<h2');
    expect(html).toContain('<strong>жирный</strong>');
    expect(html).toContain('<pre');
  });
});

describe('MarkdownField', () => {
  it('показывает заглушку при пустом значении и ошибку валидации', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <MarkdownField id="f" label="Описание" value="" onUpdate={() => {}} errorMessage="Обязательное поле" />
      </ThemeProvider>,
    );
    expect(html).toContain('Здесь появится отформатированный текст');
    expect(html).toContain('Обязательное поле');
    expect(html).toContain('for="f"');
  });
});
