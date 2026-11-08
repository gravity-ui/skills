export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'orbit.interface-language';

export function getBrowserLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Language switching still works when browser storage is unavailable.
  }
  return getBrowserLanguage();
}

const en = {
  personalWorkspace: 'Personal workspace', help: 'Help with language settings', profile: 'Personal profile: JD',
  breadcrumbs: 'Breadcrumbs', settings: 'Settings', preferences: 'Preferences', makeItYours: 'A LITTLE MORE YOU',
  title: 'Language & region', description: 'Make yourself at home. Choose the language that feels right for you.',
  interfaceLanguage: 'Interface language', chooseLanguage: 'Your workspace, in your own words.', english: 'English', russian: 'Russian',
  instant: 'A new language, instantly. No refresh needed.', saved: 'All changes saved', onThisDevice: 'On this device',
  notSaved: 'Language changed; browser storage is unavailable', thisSession: 'This session only',
  regionalFormats: 'Regional formats', formatsDescription: 'A preview of dates and numbers in your language.', date: 'Date', number: 'Number',
  browserHint: 'Prefer to follow your browser?', useBrowser: 'Use browser language', livePreview: 'LIVE PREVIEW',
  hello: 'HELLO, JORDAN', welcome: 'Room for your big ideas.', previewDescription: 'A little clarity. A lot of possibility.\nMake something great today.',
  yourWorkspace: 'Your workspace', everythingInPlace: 'Everything, in one place', projects: 'Projects', teammates: 'Teammates', betterTogether: 'Better together',
  previewCaption: 'A small look at your new experience', goodToKnow: 'Just for you',
  personalOnly: 'Your language is a personal preference. It won’t change the experience for anyone else in your workspace.',
  contentUnchanged: 'Your content stays just as you wrote it.', footer: 'A little space to do great things.', close: 'Close',
  helpTitle: 'Make Orbit speak your language',
  helpDescription: 'Choose English or Русский to translate the interface immediately. Dates and numbers follow your chosen language. Your preference is saved in this browser and restored on your next visit. Your own content is never translated.',
  gotIt: 'Got it',
};

export const copy: Record<Language, Record<keyof typeof en, string>> = {
  en,
  ru: {
    personalWorkspace: 'Личное пространство', help: 'Помощь с настройкой языка', profile: 'Личный профиль: JD',
    breadcrumbs: 'Путь к странице', settings: 'Настройки', preferences: 'Предпочтения', makeItYours: 'ЧУТЬ БОЛЬШЕ ВАС',
    title: 'Язык и регион', description: 'Чувствуйте себя как дома. Выберите язык, на котором вам удобнее.',
    interfaceLanguage: 'Язык интерфейса', chooseLanguage: 'Ваше пространство — на вашем языке.', english: 'Английский', russian: 'Русский',
    instant: 'Новый язык — сразу. Без перезагрузки страницы.', saved: 'Все изменения сохранены', onThisDevice: 'На этом устройстве',
    notSaved: 'Язык изменён; хранилище браузера недоступно', thisSession: 'Только в этом сеансе',
    regionalFormats: 'Региональные форматы', formatsDescription: 'Примеры дат и чисел на выбранном языке.', date: 'Дата', number: 'Число',
    browserHint: 'Хотите использовать язык браузера?', useBrowser: 'Выбрать язык браузера', livePreview: 'ПРЕДПРОСМОТР',
    hello: 'ПРИВЕТ, ДЖОРДАН', welcome: 'Место для больших идей.', previewDescription: 'Больше ясности. Больше возможностей.\nСоздайте что-то прекрасное сегодня.',
    yourWorkspace: 'Ваше пространство', everythingInPlace: 'Всё в одном месте', projects: 'Проекты', teammates: 'Участники', betterTogether: 'Вместе лучше',
    previewCaption: 'Небольшой взгляд на новый интерфейс', goodToKnow: 'Только для вас',
    personalOnly: 'Язык — ваша личная настройка. Она не повлияет на интерфейс других участников вашего пространства.',
    contentUnchanged: 'Ваши тексты останутся такими, как вы их написали.', footer: 'Немного места для больших свершений.', close: 'Закрыть',
    helpTitle: 'Orbit говорит на вашем языке',
    helpDescription: 'Выберите English или Русский, и интерфейс сразу переведётся. Даты и числа будут отображаться на выбранном языке. Настройка сохранится в этом браузере и восстановится при следующем посещении. Ваши тексты не переводятся.',
    gotIt: 'Понятно',
  },
};
