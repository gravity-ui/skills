import React, {useCallback, useState} from 'react';
import {DashKit} from '@gravity-ui/dashkit';
import type {Config} from '@gravity-ui/dashkit';
import {ArrowRotateLeft, Plus} from '@gravity-ui/icons';
import {Button, DropdownMenu, Flex, Icon, Switch, Text} from '@gravity-ui/uikit';

import {
  WIDGET_TEMPLATES,
  addWidget,
  createDefaultConfig,
  loadConfig,
  saveConfig,
} from './dashboard/config';
import {setupDashboard} from './dashboard/widgets';

// Register plugins and settings once, before the first DashKit render.
setupDashboard();

export function App() {
  const [config, setConfig] = useState<Config>(loadConfig);
  const [editMode, setEditMode] = useState(false);

  const updateConfig = useCallback((next: Config) => {
    setConfig(next);
    saveConfig(next);
  }, []);

  const handleChange = useCallback(
    ({config: next}: {config: Config}) => updateConfig(next),
    [updateConfig],
  );

  return (
    <Flex direction="column" gap={4} spacing={{p: 5}} style={{minHeight: '100vh', boxSizing: 'border-box'}}>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap="wrap">
        <Text variant="header-1">Дашборд</Text>

        <Flex alignItems="center" gap={3} wrap="wrap">
          <Switch checked={editMode} onUpdate={setEditMode} size="l" content="Редактирование" />

          {editMode && (
            <>
              <DropdownMenu
                items={WIDGET_TEMPLATES.map((template) => ({
                  text: template.title,
                  action: () => updateConfig(addWidget(config, template)),
                }))}
                renderSwitcher={(props) => (
                  <Button {...props} view="outlined" size="l">
                    <Icon data={Plus} size={16} />
                    Добавить виджет
                  </Button>
                )}
              />
              <Button view="flat" size="l" onClick={() => updateConfig(createDefaultConfig())}>
                <Icon data={ArrowRotateLeft} size={16} />
                Сбросить макет
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <DashKit
        config={config}
        editMode={editMode}
        onChange={handleChange}
      />
    </Flex>
  );
}
