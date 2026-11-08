import React from 'react';
import Yagr from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';

export default function MonitoringEngine({data}: {data: {x: number; y: number}[]}) {
  const config: MinimalValidConfig = {
    timeline: data.map((point) => point.x),
    series: [{data: data.map((point) => point.y), color: 'var(--g-color-line-brand)'}],
    axes: {x: {}, y: {}},
    cursor: {x: {visible: true}, y: {visible: true}},
  };
  return <Yagr id="monitoring-series" config={config} />;
}
