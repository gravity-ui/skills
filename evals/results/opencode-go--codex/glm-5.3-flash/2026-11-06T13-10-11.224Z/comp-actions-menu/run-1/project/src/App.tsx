import { Menu, Popup } from '@gravity-ui/uikit';
import { useRef, useState } from 'react';

export function App() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const actions = ['Изменить', 'Копировать', 'Переместить', 'Удалить'];

  return (
    <div style={{ padding: 24 }}>
      <button ref={buttonRef} onClick={() => setMenuOpen((isOpen) => !isOpen)}>
        Действия
      </button>
      <Popup
        open={isMenuOpen}
        anchorRef={buttonRef}
        placement={['bottom-start']}
        onOpenChange={(open) => setMenuOpen(open)}
      >
        <Menu>
          {actions.map((action) => (
            <Menu.Item key={action}>{action}</Menu.Item>
          ))}
        </Menu>
      </Popup>
    </div>
  );
}
