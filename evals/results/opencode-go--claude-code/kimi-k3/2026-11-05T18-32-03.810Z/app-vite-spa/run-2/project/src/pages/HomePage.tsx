import { Button, Card, Icon, Text } from '@gravity-ui/uikit';
import { ArrowRight } from '@gravity-ui/icons';

interface HomePageProps {
  onNavigate: (page: 'home' | 'tasks' | 'about') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Text variant="header-1">Добро пожаловать 👋</Text>
        <div style={{ marginTop: 8 }}>
          <Text variant="body-2" color="secondary">
            Это небольшое демо-приложение на три страницы: с навигацией в шапке
            и переключателем светлой/тёмной темы. Выбор темы сохраняется
            в localStorage и учитывает системные настройки.
          </Text>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <Card view="raised" style={{ padding: 20 }}>
          <Text variant="subheader-2">📋 Задачи</Text>
          <div style={{ margin: '8px 0 16px' }}>
            <Text color="secondary">
              Простой список дел: добавляйте, отмечайте выполненными и удаляйте задачи.
            </Text>
          </div>
          <Button view="outlined-action" onClick={() => onNavigate('tasks')}>
            Перейти
            <Icon data={ArrowRight} size={14} />
          </Button>
        </Card>

        <Card view="raised" style={{ padding: 20 }}>
          <Text variant="subheader-2">ℹ️ О приложении</Text>
          <div style={{ margin: '8px 0 16px' }}>
            <Text color="secondary">
              Как устроено приложение, какие технологии используются и как работает тема.
            </Text>
          </div>
          <Button view="outlined-action" onClick={() => onNavigate('about')}>
            Перейти
            <Icon data={ArrowRight} size={14} />
          </Button>
        </Card>
      </div>

      <Card view="filled" style={{ padding: 20 }}>
        <Text variant="body-2">
          💡 Совет: попробуйте переключить тему кнопкой в правом верхнем углу — интерфейс
          мгновенно перекрасится, а выбор запомнится между визитами.
        </Text>
      </Card>
    </div>
  );
}
