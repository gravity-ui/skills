import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';
import { describe, expect, it } from 'vitest';

import { ProfileSettings } from './ProfileSettings';

describe('ProfileSettings', () => {
  it('renders all fields and actions', () => {
    const html = renderToString(
      <ThemeProvider theme="light">
        <ProfileSettings />
      </ThemeProvider>,
    );

    for (const label of [
      'Настройки профиля',
      'Имя',
      'Email',
      'Аватар',
      'Загрузить',
      'Язык интерфейса',
      'Часовой пояс',
      'Двухфакторная авторизация',
      'Email-уведомления',
      'Новости продукта',
      'Системные алерты',
      'Дайджест за неделю',
      'Сохранить',
      'Отмена',
    ]) {
      expect(html).toContain(label);
    }

    expect(html).toContain('type="file"');
    expect(html).toContain('role="switch"');
    expect((html.match(/type="checkbox"/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
