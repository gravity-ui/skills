import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@gravity-ui/uikit';

import { ProfileSettings } from './ProfileSettings';
import { INITIAL_PROFILE } from './profileData';

describe('ProfileSettings (server render)', () => {
  const html = renderToStaticMarkup(
    <ThemeProvider theme="light">
      <ProfileSettings />
    </ThemeProvider>,
  );

  it('renders the initial profile values', () => {
    expect(html).toContain(INITIAL_PROFILE.name);
    expect(html).toContain(INITIAL_PROFILE.email);
  });

  it('renders all requested fields and actions', () => {
    for (const label of [
      'Имя',
      'Email',
      'Язык интерфейса',
      'Часовой пояс',
      'Двухфакторная аутентификация',
      'Email-уведомления',
      'Новости продукта',
      'Системные алерты',
      'Дайджест за неделю',
      'Сохранить',
      'Отмена',
    ]) {
      expect(html, label).toContain(label);
    }
  });

  it('renders the file input for avatar upload', () => {
    expect(html).toContain('type="file"');
  });

  it('starts with the save and cancel buttons disabled (no changes yet)', () => {
    const saveButton = html.match(/<button[^>]*>(?:(?!<\/button>).)*Сохранить/s)?.[0] ?? '';
    const cancelButton = html.match(/<button[^>]*>(?:(?!<\/button>).)*Отмена/s)?.[0] ?? '';
    expect(saveButton).toContain('disabled');
    expect(cancelButton).toContain('disabled');
  });
});
