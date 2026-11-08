// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from './App';
import { ORDERS } from './orders/mockOrders';
import { groupByStatus } from './orders/tableLogic';

const DEFAULT_HEADERS = ['Заказ', 'Клиент', 'Город', 'Позиции', 'Сумма', 'Дата', 'Статус'];

function headerNames(): string[] {
  return screen
    .getAllByRole('columnheader')
    .map((th) => th.textContent?.trim() ?? '')
    .filter((name) => name !== '');
}

function dataRows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('tbody tr:not(.group-row)'));
}

function selectedCountText(): string | null {
  return screen.queryByText(/^Выбрано: \d+$/)?.textContent ?? null;
}

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('App shell', () => {
  it('renders the dashboard home with KPI tiles and the orders table', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Главная' })).toBeTruthy();
    expect(screen.getByText('Всего заказов')).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Заказы' })).toBeTruthy();
    expect(dataRows()).toHaveLength(ORDERS.length);
  });

  it('switches sections from the sidebar and marks the active one', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Основная навигация' });

    fireEvent.click(within(nav).getByRole('button', { name: 'Пользователи' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Пользователи' })).toBeTruthy();
    expect(within(nav).getByRole('button', { name: 'Пользователи' }).getAttribute('aria-current')).toBe('page');

    fireEvent.click(within(nav).getByRole('button', { name: 'Настройки' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Настройки' })).toBeTruthy();

    fireEvent.click(within(nav).getByRole('button', { name: 'Заказы' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Заказы' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Заказы' })).toBeTruthy();
  });

  it('collapses the sidebar to icons, keeps labels as accessible names, and persists the state', () => {
    const { unmount } = render(<App />);
    const sidebar = document.querySelector('.sidebar')!;
    expect(sidebar.classList.contains('is-collapsed')).toBe(false);
    expect(screen.getByText('Пользователи')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Свернуть меню' }));
    expect(sidebar.classList.contains('is-collapsed')).toBe(true);
    expect(screen.queryByText('Пользователи')).toBeNull();
    expect(screen.getByRole('button', { name: 'Пользователи' })).toBeTruthy();
    expect(localStorage.getItem('admin.sidebarCollapsed')).toBe('true');

    unmount();
    render(<App />);
    expect(document.querySelector('.sidebar')!.classList.contains('is-collapsed')).toBe(true);
  });
});

describe('orders table', () => {
  it('groups rows by status in workflow order by default', () => {
    render(<App />);
    const expectedGroups = groupByStatus(ORDERS);
    const groupRows = document.querySelectorAll('tr.group-row');
    expect(groupRows).toHaveLength(expectedGroups.length);
    expect(dataRows()).toHaveLength(ORDERS.length);
  });

  it('turns grouping off and back on', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Группировать по статусу'));
    expect(document.querySelectorAll('tr.group-row')).toHaveLength(0);
    expect(dataRows()).toHaveLength(ORDERS.length);

    fireEvent.click(screen.getByText('Группировать по статусу'));
    expect(document.querySelectorAll('tr.group-row').length).toBeGreaterThan(0);
  });

  it('collapses and expands a status group, hiding only its rows', () => {
    render(<App />);
    const toggle = document.querySelector<HTMLButtonElement>('.group-toggle')!;
    const groupSize = Number(toggle.querySelector('.group-count')!.textContent);
    const before = dataRows().length;

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(dataRows()).toHaveLength(before - groupSize);

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(dataRows()).toHaveLength(before);
  });

  it('selects and deselects a single row, with a counter in the toolbar', () => {
    render(<App />);
    expect(selectedCountText()).toBeNull();

    const rowCheckbox = screen.getAllByLabelText(/^Выбрать заказ #/)[0];
    fireEvent.click(rowCheckbox);
    expect(selectedCountText()).toBe('Выбрано: 1');
    expect(document.querySelectorAll('tr.is-selected')).toHaveLength(1);

    fireEvent.click(rowCheckbox);
    expect(selectedCountText()).toBeNull();
    expect(document.querySelectorAll('tr.is-selected')).toHaveLength(0);
  });

  it('header checkbox selects every order, and "clear selection" resets it', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Выбрать все заказы'));
    expect(selectedCountText()).toBe(`Выбрано: ${ORDERS.length}`);

    fireEvent.click(screen.getByRole('button', { name: 'Снять выделение' }));
    expect(selectedCountText()).toBeNull();
  });

  it('group checkbox selects only the orders of that group', () => {
    render(<App />);
    const groupCheckbox = screen.getAllByLabelText(/^Выбрать все заказы:/)[0];
    const groupSize = Number(document.querySelector('.group-count')!.textContent);
    fireEvent.click(groupCheckbox);
    expect(selectedCountText()).toBe(`Выбрано: ${groupSize}`);
  });

  it('keeps selection when the group is collapsed', () => {
    render(<App />);
    fireEvent.click(screen.getAllByLabelText(/^Выбрать заказ #/)[0]);
    fireEvent.click(document.querySelector<HTMLButtonElement>('.group-toggle')!);
    expect(selectedCountText()).toBe('Выбрано: 1');
  });

  it('shows the default column order', () => {
    render(<App />);
    expect(headerNames()).toEqual(DEFAULT_HEADERS);
    expect(screen.queryByRole('button', { name: 'Сбросить порядок колонок' })).toBeNull();
  });

  it('reorders columns by drag and drop, and restores them with the reset button', () => {
    render(<App />);
    const dataTransfer = { setData: () => {}, effectAllowed: '', dropEffect: '' };
    const amount = screen.getByRole('columnheader', { name: 'Сумма' });
    const order = screen.getByRole('columnheader', { name: 'Заказ' });

    fireEvent.dragStart(amount, { dataTransfer });
    fireEvent.dragOver(order, { dataTransfer });
    fireEvent.drop(order, { dataTransfer });
    fireEvent.dragEnd(amount, { dataTransfer });

    expect(headerNames()).toEqual(['Сумма', 'Заказ', 'Клиент', 'Город', 'Позиции', 'Дата', 'Статус']);
    // Ячейки следуют за заголовками: в первой ячейке строки теперь сумма.
    const firstRowCells = dataRows()[0].querySelectorAll('td');
    expect(firstRowCells[1].textContent).toMatch(/₽|RUB|₽/);

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить порядок колонок' }));
    expect(headerNames()).toEqual(DEFAULT_HEADERS);
  });

  it('ignores a drop onto the column being dragged', () => {
    render(<App />);
    const dataTransfer = { setData: () => {}, effectAllowed: '', dropEffect: '' };
    const city = screen.getByRole('columnheader', { name: 'Город' });
    fireEvent.dragStart(city, { dataTransfer });
    fireEvent.drop(city, { dataTransfer });
    expect(headerNames()).toEqual(DEFAULT_HEADERS);
  });

  it('moves a focused column with Alt + arrow keys', () => {
    render(<App />);
    const city = screen.getByRole('columnheader', { name: 'Город' });

    fireEvent.keyDown(city, { key: 'ArrowLeft', altKey: true });
    expect(headerNames()).toEqual(['Заказ', 'Город', 'Клиент', 'Позиции', 'Сумма', 'Дата', 'Статус']);

    fireEvent.keyDown(city, { key: 'ArrowRight', altKey: true });
    expect(headerNames()).toEqual(DEFAULT_HEADERS);
  });

  it('does not move a column on arrow keys without Alt, or past the edges', () => {
    render(<App />);
    const first = screen.getByRole('columnheader', { name: 'Заказ' });
    fireEvent.keyDown(first, { key: 'ArrowLeft', altKey: true });
    expect(headerNames()).toEqual(DEFAULT_HEADERS);

    const city = screen.getByRole('columnheader', { name: 'Город' });
    fireEvent.keyDown(city, { key: 'ArrowRight' });
    expect(headerNames()).toEqual(DEFAULT_HEADERS);
  });
});
