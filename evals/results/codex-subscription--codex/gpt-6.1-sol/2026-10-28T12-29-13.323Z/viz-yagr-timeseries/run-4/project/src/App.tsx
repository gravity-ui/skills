import { useMemo } from "react";
import { useThemeType } from "@gravity-ui/uikit";
import { CpuChart } from "./CpuChart";
import { createDemoCpuSource } from "./cpuMetrics";
import "./styles.css";

export function App({ onToggleTheme }: { onToggleTheme: () => void }) {
  const source = useMemo(() => createDemoCpuSource(), []);
  const theme = useThemeType();
  return (
    <div className="app-shell">
      <header className="app-header">
        <a href="#main" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          pulse
          <span className="brand-divider" />
          <span className="brand-caption">Мониторинг системы</span>
        </a>
        <button
          className="theme-button"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
          }
        >
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
        </button>
      </header>
      <main id="main">
        <nav className="breadcrumbs" aria-label="Навигация">
          Рабочее пространство <span>/</span> Инфраструктура <span>/</span>{" "}
          <b>Мониторинг</b>
        </nav>
        <div className="page-heading">
          <div>
            <div className="eyebrow">ОБЗОР СИСТЕМЫ</div>
            <h1>Мониторинг</h1>
            <p>Все показатели. Вся картина. В реальном времени.</p>
          </div>
          <span className="environment-tag">
            <span className="status-dot" />
            Демонстрационная среда
          </span>
        </div>
        <div className="section-tabs">
          <span className="active-tab">Обзор</span>
          <span className="tab-note">Метрики системы / CPU</span>
        </div>
        <CpuChart source={source} />
        <div className="demo-note">
          <span className="info-icon" aria-hidden="true">
            i
          </span>
          <p>
            <strong>Демонстрационные данные.</strong> График показывает
            сгенерированные метрики и обновляется каждые 2 секунды. Реальные
            метрики подключаются через адаптер CpuSource.
          </p>
          <span className="demo-label">DEMO</span>
        </div>
        <footer className="page-footer">
          <span>
            <span className="status-dot" />
            Поток демоданных активен
          </span>
          <span>Хранение истории · 24 часа</span>
        </footer>
      </main>
    </div>
  );
}
