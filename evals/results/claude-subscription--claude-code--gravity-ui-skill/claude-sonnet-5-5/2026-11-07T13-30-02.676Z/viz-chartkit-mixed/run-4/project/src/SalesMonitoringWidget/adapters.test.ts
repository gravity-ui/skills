import {describe, expect, it} from 'vitest';

import {toMonitoringData, toSalesChartData} from './adapters';

describe('adapters', () => {
  it('maps sales series to gravity-charts line series', () => {
    const data = toSalesChartData([{id: 'a', name: 'A', points: [[1, 10], [2, null]]}]);
    expect(data.series.data[0]).toMatchObject({type: 'line', name: 'A', data: [{x: 1, y: 10}, {x: 2, y: null}]});
    expect(data.xAxis).toEqual({type: 'datetime'});
  });

  it('merges monitoring series onto a sorted union timeline with null gaps', () => {
    const {data} = toMonitoringData([
      {id: 'a', name: 'A', points: [[3, 1], [1, 2]]},
      {id: 'b', name: 'B', points: [[2, 5]]},
    ]);
    expect(data.timeline).toEqual([1, 2, 3]);
    expect(data.graphs.map((g) => g.data)).toEqual([[2, null, 1], [null, 5, null]]);
  });
});
