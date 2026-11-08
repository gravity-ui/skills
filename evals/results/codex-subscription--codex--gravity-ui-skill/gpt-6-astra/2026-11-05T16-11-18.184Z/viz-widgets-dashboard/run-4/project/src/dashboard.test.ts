import {describe, expect, it} from 'vitest';
import {initialConfig, readConfig, moveWidget} from './dashboard';

describe('dashboard layout persistence', () => {
  it('restores a custom position and note without losing content', () => {
    const config = initialConfig();
    config.layout[0].x = 6;
    config.layout[0].y = 40;
    config.items.push({id: 'note-1', type: 'pulse-widget', namespace: 'default', data: {kind: 'note', text: 'Проверить продажи'}});
    config.layout.push({i: 'note-1', x: 0, y: 50, w: 4, h: 9});
    expect(readConfig(JSON.stringify(config))).toEqual(config);
  });
  it.each([null, '{broken', '{}', 'null'])('recovers safely from invalid saved data: %s', (raw) => {
    expect(readConfig(raw)).toEqual(initialConfig());
  });
  it('preserves an intentionally empty dashboard', () => {
    const config = {...initialConfig(), items: [], layout: []};
    expect(readConfig(JSON.stringify(config)).items).toEqual([]);
  });
  it('rejects layouts outside the grid and unsupported widget types', () => {
    const config = initialConfig();
    config.layout[0].x = 11;
    expect(readConfig(JSON.stringify(config))).toEqual(initialConfig());
    config.layout[0].x = 0;
    config.items[0].data.kind = 'unsupported';
    expect(readConfig(JSON.stringify(config))).toEqual(initialConfig());
  });
  it('rejects duplicate layout identities', () => {
    const config = initialConfig();
    config.layout[1].i = config.layout[0].i;
    expect(readConfig(JSON.stringify(config))).toEqual(initialConfig());
  });
});

describe('keyboard widget rearrangement', () => {
  it('moves mixed-size widgets in reading order without overlaps', () => {
    const original = initialConfig();
    const next = moveWidget(original, 'trend', -1);
    const order = [...next.layout].sort((a, b) => a.y - b.y || a.x - b.x).map((l) => l.i);
    expect(order.indexOf('trend')).toBe(3);
    expect(original.layout.find((l) => l.i === 'trend')?.y).toBe(6);
    for (const a of next.layout) {
      expect(a.x + a.w).toBeLessThanOrEqual(12);
      for (const b of next.layout) {
        if (a.i !== b.i) expect(a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y).toBe(false);
      }
    }
  });
  it('leaves boundaries and unknown widget ids unchanged', () => {
    const config = initialConfig();
    expect(moveWidget(config, 'revenue', -1)).toBe(config);
    expect(moveWidget(config, 'goal', 1)).toBe(config);
    expect(moveWidget(config, 'missing', 1)).toBe(config);
  });
});
