import { useState } from 'react';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Layout } from './Layout';
import { AboutPage } from './pages/AboutPage';
import { ContactsPage } from './pages/ContactsPage';
import { HomePage } from './pages/HomePage';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout theme={theme} onThemeChange={setTheme} />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contacts" element={<ContactsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
