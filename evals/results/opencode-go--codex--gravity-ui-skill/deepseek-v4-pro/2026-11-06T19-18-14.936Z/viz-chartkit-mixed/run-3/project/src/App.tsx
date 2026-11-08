import React from 'react';
import {SalesWidget} from './SalesWidget';

export function App() {
  const [mode, setMode] = React.useState<'sales' | 'monitoring'>('sales');

  return (
    <div style={{padding: 24, maxWidth: 960, margin: '0 auto'}}>
      <SalesWidget mode={mode} onModeChange={setMode} />
    </div>
  );
}
