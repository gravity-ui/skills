import React from 'react';
import { CpuLoadChart } from './CpuLoadChart';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Monitoring</h1>
      <div
        style={{
          width: '100%',
          height: '60vh',
          minHeight: 400,
          border: '1px solid var(--g-color-line-generic)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--g-color-base-background)',
        }}
      >
        <CpuLoadChart />
      </div>
    </div>
  );
}
