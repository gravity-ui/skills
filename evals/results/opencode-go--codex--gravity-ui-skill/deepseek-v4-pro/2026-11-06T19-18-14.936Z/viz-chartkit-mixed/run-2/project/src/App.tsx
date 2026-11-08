import React from 'react';
import {Card} from '@gravity-ui/uikit';
import {VizWidget, type VizMode} from './widgets/VizWidget';

const salesData = [
  {x: 0, y: 120},
  {x: 1, y: 180},
  {x: 2, y: 140},
  {x: 3, y: 220},
  {x: 4, y: 260},
  {x: 5, y: 235},
  {x: 6, y: 310},
  {x: 7, y: 285},
];

const now = Date.now();
const HOUR = 3600_000;
const monitorData = {
  timeline: Array.from({length: 60}, (_, i) => now - (59 - i) * HOUR),
  series: [
    {id: 'cpu', name: 'CPU', color: '#4DA2F1', data: Array.from({length: 60}, (_, i) => 20 + Math.round(25 * Math.sin(i / 4) + i * 0.2))},
    {id: 'mem', name: 'Память', color: '#FF3D64', data: Array.from({length: 60}, (_, i) => 40 + Math.round(20 * Math.cos(i / 5) + i * 0.3))},
  ],
};

export function App() {
  const [mode, setMode] = React.useState<VizMode>('sales-line');

  return (
    <div style={{padding: 24, maxWidth: 1000, margin: '0 auto'}}>
      <Card theme="normal" style={{padding: 24}}>
        <VizWidget
          mode={mode}
          onModeChange={setMode}
          salesData={salesData}
          monitorData={monitorData}
        />
      </Card>
    </div>
  );
}
