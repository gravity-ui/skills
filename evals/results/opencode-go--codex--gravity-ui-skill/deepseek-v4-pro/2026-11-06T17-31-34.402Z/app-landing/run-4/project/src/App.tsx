import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';

const content = {
  blocks: [
    {
      type: 'hero-block',
      title: 'Учёт времени для команд',
      text: 'Простое и понятное отслеживание рабочего времени. Следите, кто над чем работает, без лишних таблиц и бюрократии.',
      buttons: [
        { text: 'Попробовать бесплатно', theme: 'action', url: '#signup' },
        { text: 'Узнать больше', theme: 'outlined', url: '#features' },
      ],
      verticalOffset: 'xl',
    },
    {
      type: 'card-layout-block',
      title: 'Почему выбирают нас',
      colSizes: { all: 12, sm: 6, md: 4 },
      children: [
        {
          type: 'basic-card',
          title: 'Трекер одним кликом',
          text: 'Запускайте и останавливайте таймер прямо из трея. Удобный учёт без отрыва от задач.',
          gravityIcon: { name: 'Clock', color: 'brand' },
          size: 'm',
        },
        {
          type: 'basic-card',
          title: 'Командная статистика',
          text: 'Видите загрузку каждого участника, узкие места и переработки — всё на одном дашборде.',
          gravityIcon: { name: 'Persons', color: 'brand' },
          size: 'm',
        },
        {
          type: 'basic-card',
          title: 'Готовые отчёты',
          text: 'Экспорт в PDF и CSV для клиентов и руководства. Настройте формат под свои процессы.',
          gravityIcon: { name: 'ChartBar', color: 'brand' },
          size: 'm',
        },
      ],
      indent: { top: 'l', bottom: 'l' },
    },
    {
      type: 'banner-block',
      title: 'Начните учитывать время уже сегодня',
      subtitle: 'Бесплатный тариф для команд до 5 человек. Без карты, без срока.',
      button: {
        text: 'Зарегистрироваться',
        url: '#signup',
      },
      color: { light: '#EFF2F8', dark: '#262626' },
      indent: { top: 'l', bottom: 'xl' },
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
