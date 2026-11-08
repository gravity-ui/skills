import React, {Suspense, lazy, useState} from 'react';
import {Button, Text} from '@gravity-ui/uikit';
import './app.css';

type Point = {x: number; y: number};
type VizMode = 'sales' | 'monitoring';
type WidgetProps = {mode: VizMode; onModeChange: (mode: VizMode) => void};

const SalesEngine = lazy(() => import('./SalesEngine'));
const MonitoringEngine = lazy(() => import('./MonitoringEngine'));

function VisualizationWidget({mode, onModeChange}: WidgetProps) {
  const sales = Array.from({length: 12}, (_, i) => ({x: i, y: [42, 48, 45, 57, 52, 68, 63, 76, 71, 88, 82, 96][i]}));
  const monitoring = Array.from({length: 1800}, (_, i) => ({x: i, y: 44 + Math.sin(i / 18) * 10 + Math.sin(i / 4) * 3 + (i % 173 < 5 ? 14 : 0)}));
  return <section className="widget">
    <div className="widget-heading">
      <div><Text variant="subheader-1">Визуализация показателей</Text><Text variant="caption-1" color="secondary">Единый интерфейс · два движка</Text></div>
      <div className="switcher" aria-label="Режим графика">
        <Button view={mode === 'sales' ? 'action' : 'outlined'} onClick={() => onModeChange('sales')}>Продажи</Button>
        <Button view={mode === 'monitoring' ? 'action' : 'outlined'} onClick={() => onModeChange('monitoring')}>Мониторинг</Button>
      </div>
    </div>
    <div className="chart-title"><Text variant="body-2">{mode === 'sales' ? 'Продажи по месяцам' : 'Нагрузка системы'}</Text><span className="chart-meta">{mode === 'sales' ? '12 точек · ₽ тыс.' : '1 800 измерений · интервал 1 мин'}</span></div>
    <div className="chart-area"><Suspense fallback={<div className="loading">Загрузка графика…</div>}>{mode === 'sales' ? <SalesEngine data={sales} /> : <MonitoringEngine data={monitoring} />}</Suspense></div>
    <div className="widget-footer"><span className="legend-dot"/><Text variant="caption-1">{mode === 'sales' ? 'Выручка' : 'CPU utilization'}</Text><span className="footer-note">Обновлено только что</span></div>
  </section>;
}

export function App() {
  const [mode, setMode] = useState<VizMode>('sales');
  return <main className="page"><header className="topbar"><span className="brand-mark">N</span><Text variant="subheader-2">Northstar <span className="muted">/ Аналитика</span></Text><span className="topbar-right">Рабочее пространство <b>Команда продукта</b></span></header><div className="content"><div className="eyebrow">ОБЗОР ДАННЫХ <span>•</span> 05 НОЯБРЯ 2026</div><Text variant="header-1">Показатели</Text><p className="intro">Следите за динамикой бизнеса и состоянием сервисов в одном месте.</p><VisualizationWidget mode={mode} onModeChange={setMode} /></div></main>;
}
