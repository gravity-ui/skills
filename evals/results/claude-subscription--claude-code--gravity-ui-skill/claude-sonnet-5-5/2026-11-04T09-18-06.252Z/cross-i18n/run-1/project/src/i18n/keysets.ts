export type AppLang = 'en' | 'ru';

export const APP_LANGS: AppLang[] = ['en', 'ru'];

export const keysets = {
  en: {
    app: {
      title: 'Language switcher',
      description: 'Switch the interface language between English and Russian.',
      language_label: 'Interface language',
      lang_en: 'English',
      lang_ru: 'Русский',
      name_label: 'Your name',
      name_placeholder: 'Enter your name',
      greeting: 'Hello, {{name}}!',
      greeting_anonymous: 'Hello, stranger!',
      items_count: {
        one: '{{count}} item in the cart',
        other: '{{count}} items in the cart',
        zero: 'The cart is empty',
      },
      add: 'Add item',
      reset: 'Reset',
    },
  },
  ru: {
    app: {
      title: 'Переключение языка',
      description: 'Переключайте язык интерфейса между английским и русским.',
      language_label: 'Язык интерфейса',
      lang_en: 'English',
      lang_ru: 'Русский',
      name_label: 'Ваше имя',
      name_placeholder: 'Введите имя',
      greeting: 'Привет, {{name}}!',
      greeting_anonymous: 'Привет, незнакомец!',
      items_count: {
        one: '{{count}} товар в корзине',
        few: '{{count}} товара в корзине',
        many: '{{count}} товаров в корзине',
        other: '{{count}} товара в корзине',
        zero: 'Корзина пуста',
      },
      add: 'Добавить товар',
      reset: 'Сбросить',
    },
  },
};
