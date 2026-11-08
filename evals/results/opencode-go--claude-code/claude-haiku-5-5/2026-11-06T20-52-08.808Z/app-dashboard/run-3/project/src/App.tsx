import { useEffect, useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { SECTIONS, isSectionId, type SectionId } from './nav';
import { HomePage, OrdersPage, PlaceholderPage } from './pages/Pages';
import { ORDERS } from './orders/mockOrders';
import './app.css';

const SIDEBAR_KEY = 'admin.sidebarCollapsed';

/** Раздел берётся из хэша (#/orders), чтобы ссылка и обновление страницы работали. */
function readSectionFromHash(): SectionId {
  const id = window.location.hash.replace(/^#\/?/, '');
  return isSectionId(id) ? id : 'home';
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    return false;
  }
}

export function App() {
  const [section, setSection] = useState<SectionId>(readSectionFromHash);
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);

  useEffect(() => {
    const onHashChange = () => setSection(readSectionFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {
      // Приватный режим или запрет хранилища: состояние просто не сохранится.
    }
  }, [collapsed]);

  const navigate = (id: SectionId) => {
    setSection(id);
    window.location.hash = `/${id}`;
  };

  const page = (() => {
    switch (section) {
      case 'home':
        return <HomePage orders={ORDERS} />;
      case 'orders':
        return <OrdersPage orders={ORDERS} />;
      case 'users':
        return <PlaceholderPage title="Пользователи" />;
      case 'settings':
        return <PlaceholderPage title="Настройки" />;
    }
  })();

  return (
    <div className="app">
      <Sidebar
        sections={SECTIONS}
        activeId={section}
        collapsed={collapsed}
        onSelect={navigate}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <main className="app__main">{page}</main>
    </div>
  );
}
