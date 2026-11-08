import React from 'react';
import {DashKit} from '@gravity-ui/dashkit';
import type {Config} from '@gravity-ui/dashkit';
import {Box, Button, Flex, Icon, Lang, Switch, Text, configure} from '@gravity-ui/uikit';
import {ArrowRotateLeft} from '@gravity-ui/icons';

import './dashboard/register';
import {createDefaultConfig, loadConfig, saveConfig} from './dashboard/config';

configure({lang: Lang.Ru});

export function App() {
  const [config, setConfig] = React.useState<Config>(loadConfig);
  const [editMode, setEditMode] = React.useState(false);

  // DashKit reports every layout change (drag, resize, compaction) through onChange.
  const handleChange = React.useCallback(({config: nextConfig}: {config: Config}) => {
    setConfig(nextConfig);
    saveConfig(nextConfig);
  }, []);

  const resetLayout = () => {
    const next = createDefaultConfig();
    setConfig(next);
    saveConfig(next);
  };

  return (
    <Box spacing={{p: 6}} style={{minHeight: '100vh', boxSizing: 'border-box'}}>
      <Flex direction="column" gap={5}>
        <Flex alignItems="center" justifyContent="space-between" gap={4}>
          <Text variant="header-1">Дашборд</Text>
          <Flex alignItems="center" gap={3} style={{flexShrink: 0}}>
            <Button view="outlined" size="l" onClick={resetLayout} disabled={!editMode}>
              <Icon data={ArrowRotateLeft} size={16} />
              Сбросить расположение
            </Button>
            <Switch size="l" checked={editMode} onUpdate={setEditMode}>
              Редактировать
            </Switch>
          </Flex>
        </Flex>

        <DashKit config={config} editMode={editMode} onChange={handleChange} />
      </Flex>
    </Box>
  );
}
