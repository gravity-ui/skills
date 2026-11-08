import '@gravity-ui/page-constructor/styles/styles.scss';
import './App.css';

import {
  BlockType,
  PageConstructor,
  PageConstructorProvider,
  Theme,
  type PageContent,
} from '@gravity-ui/page-constructor';
import { useThemeValue } from '@gravity-ui/uikit';

const SIGNUP_URL = '/signup';

const content: PageContent = {
  animated: false,
  blocks: [
    {
      type: BlockType.HeaderBlock,
      title: 'Учёт времени команды без лишней рутины',
      description:
        'Таймтрек — простой сервис, который показывает, сколько времени команда тратит на проекты и задачи. Запустите таймер в один клик и получите отчёт к концу недели.',
      width: 'm',
      buttons: [{ text: 'Попробовать бесплатно', theme: 'action', url: SIGNUP_URL }],
    },
    {
      type: BlockType.ExtendedFeaturesBlock,
      title: { text: 'Почему команды выбирают Таймтрек' },
      items: [
        {
          title: 'Старт за пять минут',
          text: 'Пригласите коллег по ссылке, создайте проекты — и можно засекать время. Без внедрения и обучения.',
        },
        {
          title: 'Прозрачные отчёты',
          text: 'Сводка по людям, проектам и клиентам за любой период. Видно, куда уходят часы и где команда перегружена.',
        },
        {
          title: 'Готово к выставлению счетов',
          text: 'Отмечайте оплачиваемое время и выгружайте его в CSV для бухгалтерии или клиента.',
        },
      ],
    },
    {
      type: BlockType.BannerBlock,
      title: 'Начните учитывать время команды уже сегодня',
      subtitle: '14 дней бесплатно, без привязки карты.',
      color: 'var(--g-color-base-generic)',
      button: { text: 'Создать аккаунт', theme: 'action', url: SIGNUP_URL },
    },
  ],
};

export function App() {
  const theme = useThemeValue() === 'dark' ? Theme.Dark : Theme.Light;

  return (
    <PageConstructorProvider theme={theme} locale={{ lang: 'ru' }}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
