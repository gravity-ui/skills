import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import '@gravity-ui/yagr/index.css';
import {mountCpuChart, type CpuChartStatus} from './cpu-chart';
import {type CpuDataSource} from './cpu-data';

const INITIAL_STATUS: CpuChartStatus = {phase: 'loading', count: 0, latest: null, zoomed: false};

export function CpuChart({source}: {source: CpuDataSource}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof mountCpuChart>>();
  const theme = useThemeType();
  const latestTheme = useRef(theme);
  latestTheme.current = theme;
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus(INITIAL_STATUS);
    const instance = mountCpuChart(host.current!, source, latestTheme.current, setStatus);
    controller.current = instance;
    return () => {
      controller.current = undefined;
      instance.dispose();
    };
  }, [source, attempt]);

  useEffect(() => controller.current?.setTheme(theme), [theme]);

  return (
    <section className="cpu-panel" aria-labelledby="cpu-title">
      <div className="panel-heading">
        <div className="heading-copy">
          <Text as="h2" variant="subheader-3" id="cpu-title">Загрузка CPU</Text>
          <Text color="secondary">Последние 24 часа · время в вашем часовом поясе</Text>
        </div>
        <div className="live-label">
          {status.phase === 'ready' && <span className="live-dot" />}
          {status.phase === 'error' ? 'Ошибка получения данных' : status.phase === 'loading' ? 'Подключение…' : status.phase === 'empty' ? 'Нет данных' : 'Обновление в реальном времени'}
        </div>
      </div>
      <div className="metric-row">
        <div>
          <Text variant="display-2">{status.latest === null ? '—' : status.latest.toFixed(1)}</Text>
          <Text variant="subheader-2" color="secondary"> %</Text>
          <Text as="div" variant="caption-2" color="secondary">Последнее измерение</Text>
        </div>
        <Button view="outlined" onClick={() => controller.current?.resetZoom()} disabled={!status.zoomed}>
          Вернуться к 24 часам
        </Button>
      </div>
      <div className="plot-area" aria-busy={status.phase === 'loading'}>
        <div ref={host} className="cpu-plot" role="img" aria-label="Интерактивный график загрузки CPU от 0 до 100 процентов за последние сутки" />
        {(status.phase === 'loading' || status.phase === 'empty') && (
          <div className="plot-state" role="status">
            <Text color="secondary">{status.phase === 'loading' ? 'Загрузка истории CPU…' : 'Нет измерений за последние сутки'}</Text>
          </div>
        )}
      </div>
      {status.phase === 'error' && (
        <div className="error-state" role="alert">
          <Text>Не удалось получить метрики. Показаны последние доступные данные.</Text>
          <Button view="outlined" onClick={() => setAttempt((value) => value + 1)}>Повторить</Button>
        </div>
      )}
      <div className="chart-footer">
        <Text variant="caption-2" color="secondary">Наведите курсор для просмотра значения. Выделите участок, чтобы приблизить.</Text>
        <Text variant="caption-2" color="secondary">
          {status.count.toLocaleString('ru-RU')} точек
          {status.updatedAt && ` · Обновлено ${new Date(status.updatedAt).toLocaleTimeString('ru-RU')}`}
        </Text>
      </div>
    </section>
  );
}
