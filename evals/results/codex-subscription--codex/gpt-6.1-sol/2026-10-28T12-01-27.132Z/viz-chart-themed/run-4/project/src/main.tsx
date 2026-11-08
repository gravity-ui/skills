// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, type Theme } from "@gravity-ui/uikit";

import { App } from "./App";

function Root() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("pulse-theme");
      return saved === "light" || saved === "dark" ? saved : "system";
    } catch {
      return "system";
    }
  });
  function changeTheme(value: Theme) {
    setTheme(value);
    try {
      localStorage.setItem("pulse-theme", value);
    } catch {
      /* Theme works without storage. */
    }
  }
  return (
    <ThemeProvider theme={theme} lang="ru">
      <App onThemeChange={changeTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
