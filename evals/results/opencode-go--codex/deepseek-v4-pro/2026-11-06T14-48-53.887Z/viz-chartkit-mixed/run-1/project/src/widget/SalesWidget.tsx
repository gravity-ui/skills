import React, {useState} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {SAMPLE_DATA} from '../data/sample';
import type {WidgetData} from '../data/types';
import {useEngine, useEngineRender, type EngineName} from './use-engine';

const MODES: {value: EngineName; content: string}[] = [
  {value: 'line', content: 'Линейный график продаж'},
  {value: 'monitor', content: 'Мониторинг (временной ряд)'},
];

interface SalesWidgetProps {
  /** Данные; если не переданы — SAMPLE_DATA */
  data?: WidgetData;
  width?: string | number;
  height?: number;
}

export const SalesWidget: React.FC<SalesWidgetProps> = ({
  data = SAMPLE_DATA,
  width = '100%',
  height = 340,
}) => {
  const [mode, setMode] = useState<EngineName>('line');
  const engine = useEngine(mode);
  const svgRef = useEngineRender(engine, data);

  return (
    <div style={{width, fontFamily: 'Inter, system-ui, sans-serif'}}>
      <SegmentedRadioGroup
        value={mode}
        onChange={e => setMode(e.target.value as EngineName)}
        options={MODES}
      />
      <div style={{marginTop: 16, border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden'}}>
        <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${600} ${height}`} />
      </div>
    </div>
  );
};
