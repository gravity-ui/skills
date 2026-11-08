import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useI18n, type Language } from './i18n';

export function App() {
  const { language, setLanguage, translate } = useI18n();

  return (
    <div style={{ display: 'grid', gap: 16, padding: 24 }}>
      <label style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <span>{translate('languageSwitcher')}</span>
        <SegmentedRadioGroup<Language>
          value={language}
          onUpdate={(value) => setLanguage(value)}
        >
          <SegmentedRadioGroup.Option value="en">English</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="ru">Русский</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </label>

      <main style={{ display: 'grid', gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>{translate('greeting')}</h1>
        <p style={{ margin: 0, color: 'var(--g-color-text-secondary)' }}>
          {translate('description')}
        </p>
        <p style={{ margin: 0, color: 'var(--g-color-text-secondary)' }}>
          {translate('currentLanguage')}
        </p>
      </main>
    </div>
  );
}
