import {afterEach, expect, test} from 'vitest';
import {getConfig} from '@gravity-ui/uikit';

import {getLang, i18n, setLang} from './index';

afterEach(() => {
  setLang('en');
});

test('switches app strings between en and ru', () => {
  setLang('en');
  expect(getLang()).toBe('en');
  expect(i18n('page_title')).toBe('Settings');

  setLang('ru');
  expect(getLang()).toBe('ru');
  expect(i18n('page_title')).toBe('Настройки');
});

test('syncs uikit component language via configure', () => {
  setLang('ru');
  expect(getConfig().lang).toBe('ru');

  setLang('en');
  expect(getConfig().lang).toBe('en');
});

test('interpolates template params', () => {
  setLang('en');
  expect(i18n('greeting', {name: i18n('greeting_name')})).toBe('Hello, Sasha! You are signed in.');

  setLang('ru');
  expect(i18n('greeting', {name: i18n('greeting_name')})).toBe(
    'Привет, Саша! Вы вошли в систему.',
  );
});

test('pluralizes per language rules', () => {
  setLang('ru');
  expect(i18n('items_count', {count: 0})).toBe('Пока нет товаров');
  expect(i18n('items_count', {count: 1})).toBe('1 товар');
  expect(i18n('items_count', {count: 3})).toBe('3 товара');
  expect(i18n('items_count', {count: 5})).toBe('5 товаров');

  setLang('en');
  expect(i18n('items_count', {count: 0})).toBe('No items yet');
  expect(i18n('items_count', {count: 1})).toBe('1 item');
  expect(i18n('items_count', {count: 3})).toBe('3 items');
});
