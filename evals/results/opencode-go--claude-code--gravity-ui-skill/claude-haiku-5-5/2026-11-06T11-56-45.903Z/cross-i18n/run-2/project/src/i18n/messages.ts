// App strings. `en` is the source of truth; `ru` is typed against it, so a key
// missing from the Russian catalog fails the typecheck.
const en = {
  app: {
    title: 'Gravity UI demo',
    description: 'Switch the interface language. Built-in Gravity UI components follow the same setting.',
    language: 'Interface language',
    nameLabel: 'Name',
    namePlaceholder: 'Enter your name',
    cityLabel: 'City',
    cityPlaceholder: 'Choose a city',
    cityMoscow: 'Moscow',
    cityBerlin: 'Berlin',
    cityNewYork: 'New York',
    pageStatus: 'Page {{page}} of {{pages}}',
    savedHint: 'Your language choice is saved in this browser.',
  },
};

export type Messages = typeof en;

const ru: Messages = {
  app: {
    title: 'Демо Gravity UI',
    description:
      'Переключайте язык интерфейса. Встроенные компоненты Gravity UI следуют этой же настройке.',
    language: 'Язык интерфейса',
    nameLabel: 'Имя',
    namePlaceholder: 'Введите имя',
    cityLabel: 'Город',
    cityPlaceholder: 'Выберите город',
    cityMoscow: 'Москва',
    cityBerlin: 'Берлин',
    cityNewYork: 'Нью-Йорк',
    pageStatus: 'Страница {{page}} из {{pages}}',
    savedHint: 'Выбранный язык сохраняется в этом браузере.',
  },
};

export const messages = { en, ru } as const;
