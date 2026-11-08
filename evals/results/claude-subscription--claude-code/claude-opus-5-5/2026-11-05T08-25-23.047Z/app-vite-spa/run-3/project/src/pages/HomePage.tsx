import { Button, Card, Text } from '@gravity-ui/uikit';

import { navigate } from '../router';
import { useAppTheme } from '../theme';

const FEATURES = [
  { title: 'Навигация', text: 'Три страницы с переключением через вкладки в шапке. Работают кнопки «назад/вперёд» браузера.' },
  { title: 'Тёмная тема', text: 'Переключатель в правом верхнем углу. Выбор сохраняется между перезагрузками.' },
  { title: 'Gravity UI', text: 'Интерфейс собран на компонентах @gravity-ui/uikit и иконках @gravity-ui/icons.' },
];

export function HomePage() {
  const { theme } = useAppTheme();

  return (
    <section className="page">
      <Text variant="display-1" as="h1">
        Добро пожаловать!
      </Text>
      <Text color="secondary">
        Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
      </Text>
      <div className="cards">
        {FEATURES.map((f) => (
          <Card key={f.title} className="cards__item" view="outlined">
            <Text variant="subheader-2">{f.title}</Text>
            <Text color="secondary">{f.text}</Text>
          </Card>
        ))}
      </div>
      <div>
        <Button view="action" size="l" onClick={() => navigate('tasks')}>
          Перейти к задачам
        </Button>
      </div>
    </section>
  );
}
