import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, it, expect, vi, afterEach} from 'vitest';
import {ThemeProvider} from '@gravity-ui/uikit';
import {App} from './App';
import {initialOrders} from './data';

// The server renderer checks the composed Gravity table without a browser installation.
describe('Orders dashboard', () => {
 afterEach(() => vi.unstubAllGlobals());
 function render(saved: Record<string, unknown> = {}) {
  vi.stubGlobal('window', {innerWidth: 1440, matchMedia: () => ({matches: false, addEventListener: () => {}, removeEventListener: () => {}})});
  vi.stubGlobal('localStorage', {getItem: (key: string) => JSON.stringify(saved[key] ?? null), setItem: () => {}});
  return renderToStaticMarkup(<ThemeProvider theme="light"><App/></ThemeProvider>);
 }
 it('renders expandable status groups and ten individually selectable orders', () => {
  const markup = render();
  expect(markup.match(/class="gt-table__cell group-row-cell"/g)).toHaveLength(3);
  expect(markup.match(/aria-label="Выбрать заказ /g)).toHaveLength(10);
  expect(markup.match(/aria-label="Выбрать группу /g)).toHaveLength(3);
  expect(markup).toContain('aria-expanded="true"');
  expect(markup).not.toContain('#group-');
 });
 it('renders the empty state for an empty saved order list', () => {
  const markup = render({'orbit-orders': []});
  expect(markup).toContain('Заказы не найдены');
  expect(markup).not.toContain('aria-label="Выбрать заказ ');
 });
 it('restores hidden columns while retaining selection', () => {
  const markup = render({'orbit-visibility': {paid: false}, 'orbit-orders': [initialOrders[0]]});
  expect(markup).not.toContain('class="payment paid"');
  expect(markup).toContain('aria-label="Выбрать заказ 10482"');
 });
});
