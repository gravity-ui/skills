import React, {useCallback, useEffect, useState} from 'react';
import {Button, Switch, Text} from '@gravity-ui/uikit';
import {DashKit} from '@gravity-ui/dashkit';
import type {Config} from '@gravity-ui/dashkit';

import './dashkit-setup';
import {clearSavedConfig, createDefaultConfig, loadConfig, saveConfig} from './dashboard-config';

// Ниже этой ширины сетка из 36 колонок становится непригодной (колонки в доли пикселя),
// поэтому включаем встроенный мобильный layout DashKit: виджеты в один столбец, без перетаскивания.
const MOBILE_QUERY = '(max-width: 767px)';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function Dashboard() {
  const [config, setConfig] = useState<Config>(loadConfig);
  const [editMode, setEditMode] = useState(false);
  const isMobile = useIsMobile();
  const canEdit = editMode && !isMobile;

  // DashKit читает isMobile из глобальных настроек во время рендера. Выставляем их до
  // рендера <DashKit> (key ниже пересоздаёт инстанс при смене режима).
  DashKit.setSettings({isMobile});

  // DashKit отдаёт новый config после каждого перетаскивания или изменения размера.
  // Сохраняем его в состояние (контролируемый режим) и в localStorage.
  const handleChange = useCallback(({config: next}: {config: Config}) => {
    setConfig(next);
    saveConfig(next);
  }, []);

  const handleReset = useCallback(() => {
    clearSavedConfig();
    setConfig(createDefaultConfig());
  }, []);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-4)', minHeight: '100vh'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--g-spacing-3)',
        }}
      >
        <Text variant="body-1" color="secondary">
          {isMobile
            ? 'На узком экране виджеты идут одним столбцом. Расположение меняется на большом экране.'
            : canEdit
              ? 'Перетаскивайте виджеты за заголовок и тяните за угол, чтобы менять размер.'
              : 'Включите режим редактирования, чтобы менять расположение виджетов.'}
        </Text>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--g-spacing-3)'}}>
          <Button view="outlined" onClick={handleReset}>
            Сбросить раскладку
          </Button>
          {!isMobile && <Switch checked={editMode} onUpdate={setEditMode} content="Редактирование" />}
        </div>
      </div>

      <DashKit
        key={isMobile ? 'mobile' : 'desktop'}
        config={config}
        editMode={canEdit}
        onChange={handleChange}
      />
    </div>
  );
}
