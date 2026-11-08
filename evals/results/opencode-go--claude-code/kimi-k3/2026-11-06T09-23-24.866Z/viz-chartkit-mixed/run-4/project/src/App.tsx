import {useEffect, useState} from 'react';
import {SegmentedRadioGroup, ThemeProvider} from '@gravity-ui/uikit';

import {VizWidget} from './widget/VizWidget';
import {demoModes} from './demoData';
import './app.css';

const apiSnippet = `// Единый API: режимы описаны данными, движки подгружаются лениво
<VizWidget
  modes={{
    sales:      {kind: 'sales',      title: 'Продажи по каналам',   times, series, unit: '₽',  …},
    monitoring: {kind: 'monitoring', title: 'Задержка ответа',      times, series, unit: 'мс', …},
  }}
  initialMode="sales"
  mode={mode}                 // опционально: контролируемый режим
  onModeChange={setMode}
/>
// Первый выбор режима делает import() его движка —
// SVG для продаж, Canvas для плотного ряда.`;

export function App(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <main className="page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Виджет визуализации</h1>
            <p className="page-subtitle">
              Один виджет, единый API, два движка графиков с ленивой загрузкой
            </p>
          </div>
          <SegmentedRadioGroup
            name="theme"
            value={theme}
            onUpdate={(v) => setTheme(v as 'light' | 'dark')}
            options={[
              {value: 'light', content: 'Светлая'},
              {value: 'dark', content: 'Тёмная'},
            ]}
          />
        </header>

        <VizWidget modes={demoModes} initialMode="sales" />

        <section className="page-api">
          <h2 className="page-api-title">Единый API виджета</h2>
          <pre className="page-api-code">
            <code>{apiSnippet}</code>
          </pre>
        </section>
      </main>
    </ThemeProvider>
  );
}
