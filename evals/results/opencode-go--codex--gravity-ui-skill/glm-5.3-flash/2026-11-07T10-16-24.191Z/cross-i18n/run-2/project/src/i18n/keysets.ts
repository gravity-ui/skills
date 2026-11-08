export interface AppKeysets {
  app: {
    title: string;
    subtitle: string;
    language: string;
    english: string;
    russian: string;
    selected: string;
  };
}

export const en: AppKeysets = {
  app: {
    title: 'Gravity UI application',
    subtitle: 'The interface language can be switched at any time.',
    language: 'Interface language',
    english: 'English',
    russian: 'Russian',
    selected: 'Current language:',
  },
};

export const ru: AppKeysets = {
  app: {
    title: 'Приложение Gravity UI',
    subtitle: 'Язык интерфейса можно переключить в любой момент.',
    language: 'Язык интерфейса',
    english: 'Английский',
    russian: 'Русский',
    selected: 'Текущий язык:',
  },
};
