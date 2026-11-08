import React from 'react';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
export default function SalesEngine({data}: {data: {x: number; y: number}[]}) {
  const chartData = {series: {data: [{type: 'line', name: 'Выручка', data}]}} as ChartData;
  return <Chart data={chartData} />;
}
