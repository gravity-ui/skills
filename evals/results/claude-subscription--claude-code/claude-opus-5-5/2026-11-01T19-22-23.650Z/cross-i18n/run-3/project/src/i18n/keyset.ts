import { addComponentKeysets } from '@gravity-ui/uikit/i18n';

const en = {
  title: 'Welcome',
  description: 'This interface is available in English and Russian. Gravity UI components switch along with it.',
  'label_language': 'Language',
  'label_name': 'Your name',
  'placeholder_name': 'Enter your name',
  greeting: 'Hello, {{name}}!',
  'greeting_anonymous': 'Hello, stranger!',
  'label_items': {
    one: '{{count}} item',
    other: '{{count}} items',
  },
  'button_add': 'Add item',
  'button_reset': 'Reset',
  'section_library': 'Built-in component texts',
  'label_copy': 'Copy greeting',
} as const;

const ru = {
  title: 'Добро пожаловать',
  description: 'Интерфейс доступен на английском и русском. Компоненты Gravity UI переключаются вместе с ним.',
  'label_language': 'Язык',
  'label_name': 'Ваше имя',
  'placeholder_name': 'Введите имя',
  greeting: 'Привет, {{name}}!',
  'greeting_anonymous': 'Привет, незнакомец!',
  'label_items': {
    one: '{{count}} элемент',
    few: '{{count}} элемента',
    many: '{{count}} элементов',
    other: '{{count}} элемента',
  },
  'button_add': 'Добавить элемент',
  'button_reset': 'Сбросить',
  'section_library': 'Встроенные тексты компонентов',
  'label_copy': 'Скопировать приветствие',
} as const;

export const appI18n = addComponentKeysets({ en, ru }, 'App');
