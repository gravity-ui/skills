import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

function setHash(hash: string) {
  window.location.hash = hash;
}

async function waitForRoute(heading: string) {
  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy());
}

describe('Мини-приложение', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    setHash('');
  });
  afterEach(cleanup);

  it('показывает главную страницу и три вкладки навигации', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Главная' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Главная', 'О проекте', 'Настройки']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(document.title).toContain('Главная');
  });

  it('переходит между страницами по вкладкам и по hash', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'О проекте' }));
    await waitForRoute('О проекте');
    expect(window.location.hash).toBe('#/about');
    expect(screen.getByRole('tab', { name: 'О проекте' }).getAttribute('aria-selected')).toBe('true');

    await user.click(screen.getByRole('tab', { name: 'Настройки' }));
    await waitForRoute('Настройки');
    expect(window.location.hash).toBe('#/settings');

    // Прямой переход по адресу (как кнопка «назад» или ввод в строке адреса)
    act(() => setHash('#/'));
    await waitForRoute('Главная');
  });

  it('показывает 404 для неизвестного адреса и возвращает на главную', async () => {
    const user = userEvent.setup();
    setHash('#/nope');
    render(<App />);
    await waitForRoute('Страница не найдена');
    expect(screen.queryAllByRole('tab', { selected: true })).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'На главную' }));
    await waitForRoute('Главная');
    expect(window.location.hash).toBe('#/');
  });

  it('переключает тему кнопкой в шапке и сохраняет выбор', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.body.classList.contains('g-root_theme_light')).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
    expect(document.body.classList.contains('g-root_theme_dark')).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Включить светлую тему' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Включить светлую тему' }));
    expect(document.body.classList.contains('g-root_theme_light')).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('восстанавливает сохранённую тему при запуске', () => {
    localStorage.setItem('app-theme', 'dark');
    render(<App />);
    expect(document.body.classList.contains('g-root_theme_dark')).toBe(true);
  });

  it('переключает тему на странице настроек', async () => {
    const user = userEvent.setup();
    setHash('#/settings');
    render(<App />);
    await waitForRoute('Настройки');

    const sw = screen.getByRole('switch', { name: 'Тёмная тема' });
    expect(sw.getAttribute('aria-checked') ?? (sw as HTMLInputElement).checked.toString()).toBe('false');
    await user.click(sw);
    expect(document.body.classList.contains('g-root_theme_dark')).toBe(true);

    await user.click(screen.getByRole('radio', { name: 'Светлая' }));
    expect(document.body.classList.contains('g-root_theme_light')).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('light');
  });
});
