import {Button, Card, Text} from '@gravity-ui/uikit';
import './App.css';

type AppProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

export function App({isDark, onToggleTheme}: AppProps) {
  return (
    <main className="page">
      <section className="theme-panel" aria-labelledby="page-title">
        <div className="panel-topline">
          <span className="brand-mark" aria-hidden="true">G</span>
          <Text variant="body-2" color="secondary">НАСТРОЙКИ ВИДА</Text>
        </div>

        <div className="panel-content">
          <div className="intro">
            <Text variant="display-2" as="h1" id="page-title">Тема оформления</Text>
            <Text variant="body-2" color="secondary">
              Выберите комфортный режим для работы. Настройка сохраняется на этом устройстве.
            </Text>
          </div>

          <Card className="theme-card" view="outlined" type="container" size="l">
            <div className="theme-copy">
              <span className={`theme-symbol ${isDark ? 'theme-symbol_dark' : 'theme-symbol_light'}`} aria-hidden="true">
                {isDark ? '☾' : '☀'}
              </span>
              <div className="theme-description">
                <Text variant="subheader-2">{isDark ? 'Тёмная тема' : 'Светлая тема'}</Text>
                <Text variant="body-1" color="secondary">
                  {isDark ? 'Мягче для глаз при слабом освещении' : 'Чёткий и привычный вид интерфейса'}
                </Text>
              </div>
            </div>
            <Button
              view="outlined"
              size="l"
              aria-pressed={isDark}
              onClick={onToggleTheme}
            >
              Переключить на {isDark ? 'светлую' : 'тёмную'}
            </Button>
          </Card>

          <div className="preview-label">
            <Text variant="caption-2" color="secondary">ПРЕДПРОСМОТР</Text>
          </div>
          <Card className="preview-card" view="outlined" type="container" size="l">
            <div className="preview-heading">
              <div className="avatar" aria-hidden="true">A</div>
              <div>
                <Text variant="subheader-2">Рабочее пространство</Text>
                <Text variant="body-1" color="secondary">Всё готово к работе</Text>
              </div>
              <span className="status-dot" aria-label="В сети" />
            </div>
            <div className="preview-line" />
            <div className="preview-footer">
              <Text variant="body-1" color="secondary">Внешний вид применяется ко всему приложению</Text>
              <span className="mode-chip">{isDark ? 'DARK' : 'LIGHT'}</span>
            </div>
          </Card>
        </div>

        <footer className="panel-footer">
          <Text variant="caption-2" color="secondary">GRAVITY UI · THEME SETTINGS</Text>
          <span className="theme-indicator"><span className="indicator-dot" />Активна {isDark ? 'тёмная' : 'светлая'} тема</span>
        </footer>
      </section>
    </main>
  );
}
