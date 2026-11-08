import { useState } from 'react';
import { DashKit } from '@gravity-ui/dashkit';
import type { DashKitProps } from '@gravity-ui/dashkit';
import { Switch, Text } from '@gravity-ui/uikit';

import { initialConfig } from './dashboard/config';
// Side-effect import: registers the widget plugins exactly once.
import './dashboard/plugins';
import './App.css';

export function App() {
  const [editMode, setEditMode] = useState(true);
  const [config, setConfig] = useState<DashKitProps['config']>(initialConfig);

  // DashKit is controlled: on drag/resize it hands back the updated config
  // (new layout positions), which we store to keep the arrangement.
  const handleChange: DashKitProps['onChange'] = ({ config: updatedConfig }) => {
    setConfig(updatedConfig);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <Text variant="header-2">Дашборд</Text>
        <Switch checked={editMode} onUpdate={setEditMode}>
          Режим редактирования
        </Switch>
      </header>
      <Text color="secondary">
        {editMode
          ? 'Перетаскивайте виджеты по сетке и меняйте их размер за правый нижний угол.'
          : 'Включите режим редактирования, чтобы свободно переставлять виджеты.'}
      </Text>
      <DashKit
        editMode={editMode}
        config={config}
        onChange={handleChange}
      />
    </div>
  );
}
