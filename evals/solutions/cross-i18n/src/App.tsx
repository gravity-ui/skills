import { useState } from 'react';
import { SegmentedRadioGroup, Table, Text, configure } from '@gravity-ui/uikit';
import type { TableColumnConfig, TableDataItem } from '@gravity-ui/uikit';

import { DEFAULT_LANG, appI18n, i18n, type AppLang } from './i18n';

// Keep both i18n runtimes on the same language: configure({lang}) switches the
// texts built into Gravity UIKit components (en/ru), appI18n.setLang() switches
// the app's own keysets from @gravity-ui/i18n.
function applyLang(lang: AppLang) {
  configure({ lang });
  appI18n.setLang(lang);
}

// Sync both runtimes with the initial language before the first render.
applyLang(DEFAULT_LANG);

export function App() {
  const [lang, setLang] = useState<AppLang>(DEFAULT_LANG);

  const handleLangUpdate = (next: AppLang) => {
    applyLang(next);
    // The state update re-renders the tree, so app strings are re-read from the
    // keysets in the new language (UIKit's own texts react to configure() by themselves).
    setLang(next);
  };

  // Built at render time so header labels are always in the current language.
  const columns: TableColumnConfig<TableDataItem>[] = [
    { id: 'name', name: i18n('column_name') },
    { id: 'value', name: i18n('column_value') },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">{i18n('title')}</Text>
      <Text color="secondary">{i18n('description')}</Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text variant="subheader-1">{i18n('language_label')}</Text>
        <SegmentedRadioGroup value={lang} onUpdate={handleLangUpdate} size="l">
          <SegmentedRadioGroup.Option value="en">{i18n('language_en')}</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="ru">{i18n('language_ru')}</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </div>

      <Text>{i18n('greeting')}</Text>

      <Text color="secondary">{i18n('uikit_hint')}</Text>
      {/* Empty on purpose: the "No data" / «Нет данных» placeholder is UIKit's own
          localized text, demonstrating that configure({lang}) switches library texts. */}
      <Table data={[]} columns={columns} />
    </div>
  );
}
