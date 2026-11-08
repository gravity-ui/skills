import { useMemo, useState } from "react";
import { Button, Text, ThemeProvider } from "@gravity-ui/uikit";
import { VisualizationWidget } from "./components/VisualizationWidget";
import { createDemoData } from "./lib/data";
import type { WidgetMode } from "./lib/types";
import "./styles.css";

export function App() {
  const [mode, setMode] = useState<WidgetMode>("sales");
  const [range, setRange] = useState("30");
  const [dark, setDark] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const data = useMemo(
    () => createDemoData(mode, Number(range)),
    [mode, range],
  );
  return (
    <ThemeProvider theme={dark ? "dark" : "light"}>
      <div className="app">
        <header className="app-header">
          <a className="wordmark" href="./" aria-label="Пульс — главная">
            <span className="brand-mark">
              <i />
              <i />
              <i />
              <i />
            </span>
            пульс<span className="wordmark-dot">.</span>
          </a>
          <span className="header-divider" />
          <span className="workspace-name">
            Рабочее пространство <span className="workspace-badge">PRO</span>
          </span>
          <div className="header-right">
            <span className="demo-label">
              <span className="status-dot" />
              Демо-пространство
            </span>
            <Button
              view="flat"
              size="m"
              onClick={() => setDark(!dark)}
              aria-label={
                dark ? "Включить светлую тему" : "Включить темную тему"
              }
            >
              {dark ? "☀" : "◐"}
            </Button>
            <span className="avatar" title="Алексей Смирнов">
              АС
            </span>
          </div>
        </header>
        <main className="main-content">
          <div className="breadcrumbs">
            Рабочее пространство <span>/</span>{" "}
            <span className="breadcrumb-current">Аналитика</span>
          </div>
          <div className="page-heading">
            <div>
              <div className="eyebrow">КАЖДАЯ ТОЧКА ИМЕЕТ ЗНАЧЕНИЕ</div>
              <Text variant="display-2" as="h1" className="page-title">
                Обзор показателей
              </Text>
              <p className="page-description">
                От общей картины до каждой секунды. Ваши данные в одном месте.
              </p>
            </div>
            <div className="page-note">
              <span className="status-dot" />
              Все системы в норме
            </div>
          </div>
          <VisualizationWidget
            mode={mode}
            onModeChange={(value) => {
              setMode(value);
              setRange(value === "sales" ? "30" : "24");
            }}
            data={data}
            range={range}
            onRangeChange={setRange}
            updatedAt={updatedAt}
            onRefresh={() => setUpdatedAt(new Date())}
          />
          <div className="context-row">
            <div className="context-icon">↗</div>
            <div>
              <Text variant="subheader-1">
                Больше контекста. Точнее решения.
              </Text>
              <p>
                Переключайтесь между продажами и мониторингом, сохраняя фокус на
                главном.
              </p>
            </div>
            <span className="context-decoration" aria-hidden="true">
              ···╱··╲╱···╱
            </span>
          </div>
          <footer className="page-footer">
            <span>Пульс · Пространство для ваших данных</span>
            <span>
              Демонстрационные данные <span className="footer-dot">·</span>{" "}
              Часовой пояс UTC
            </span>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
