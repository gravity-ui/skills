import { Card, Text } from '@gravity-ui/uikit';

const FEATURES = [
  { title: 'Три страницы', text: 'Главная, «Возможности» и «О проекте» с общей шапкой.' },
  { title: 'Hash-навигация', text: 'Ссылки вида #/about работают без сервера, кнопка «Назад» тоже.' },
  { title: 'Две темы', text: 'Светлая и тёмная темы Gravity UI переключаются мгновенно.' },
  { title: 'Запоминание выбора', text: 'Тема хранится в localStorage.' },
];

export function Features() {
  return (
    <div className="page">
      <Text variant="display-1" as="h1">
        Возможности
      </Text>
      <div className="grid">
        {FEATURES.map((f) => (
          <Card key={f.title} type="container" view="outlined" className="card">
            <Text variant="subheader-2" as="h2">
              {f.title}
            </Text>
            <Text color="secondary" as="p">
              {f.text}
            </Text>
          </Card>
        ))}
      </div>
    </div>
  );
}
