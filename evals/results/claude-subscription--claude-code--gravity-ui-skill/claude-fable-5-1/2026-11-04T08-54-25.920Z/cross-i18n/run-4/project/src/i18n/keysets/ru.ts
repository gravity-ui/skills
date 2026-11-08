import type {en} from './en';

type Keysets = {
  [K in keyof typeof en]: {
    [Key in keyof (typeof en)[K]]: (typeof en)[K][Key] extends string
      ? string
      : {[Form in keyof (typeof en)[K][Key]]: string} & {few?: string; many?: string};
  };
};

export const ru: Keysets = {
  app: {
    title: 'Демо локализации Gravity UI',
    subtitle: 'Переключите язык интерфейса — обновятся и строки приложения, и встроенные подписи Gravity UI.',
    language: 'Язык',
    'current-language': 'Текущий язык: {{lang}}',
    'card-title': 'Обзор проекта',
    'card-text':
      'Эта карточка переведена через кейсеты @gravity-ui/i18n. Пагинация, уведомление и кнопка копирования ниже берут подписи из самого Gravity UI.',
    'items-count': {
      zero: 'Нет элементов',
      one: '{{count}} элемент',
      few: '{{count}} элемента',
      many: '{{count}} элементов',
      other: '{{count}} элемента',
    },
    today: 'Сегодня {{date}}',
    'alert-title': 'Язык сохранён',
    'alert-message': 'Выбор хранится в браузере и восстанавливается при следующем визите.',
    'copy-label': 'Скопировать ссылку',
    save: 'Сохранить',
    cancel: 'Отмена',
    'items-label': 'Элементов на странице',
  },
};
