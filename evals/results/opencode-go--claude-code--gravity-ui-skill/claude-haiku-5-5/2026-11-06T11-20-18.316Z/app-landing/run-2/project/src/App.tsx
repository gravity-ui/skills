import '@gravity-ui/page-constructor/styles/styles.scss';
import {PageConstructor, PageConstructorProvider} from '@gravity-ui/page-constructor';
import type {PageConstructorProps} from '@gravity-ui/page-constructor';

import './App.css';

// Placeholder: replace with the real sign-up / product URL.
const CTA_URL = '#';

const content: PageConstructorProps['content'] = {
  blocks: [
    {
      type: 'header-block',
      overtitle: 'Учёт времени для команд',
      title: 'Видно, где уходит время команды',
      description:
        'Участники отмечают часы по задачам в один клик, а руководитель получает понятные отчёты по проектам и людям.',
    },
    {
      type: 'extended-features-block',
      items: [
        {
          title: 'Таймер в один клик',
          text: 'Запускайте и останавливайте учёт прямо из задачи, без таблиц и ручных записей в конце дня.',
        },
        {
          title: 'Отчёты по проектам',
          text: 'Сколько времени ушло на каждую задачу, проект и участника команды.',
        },
        {
          title: 'Прозрачность для команды',
          text: 'Все видят одни и те же данные, поэтому план и факт не расходятся.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Создайте рабочее пространство и пригласите команду за несколько минут.',
      button: {text: 'Начать работу', url: CTA_URL},
    },
  ],
};

export function App() {
  return (
    <PageConstructorProvider>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
