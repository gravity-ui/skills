import { configure } from '@gravity-ui/uikit';

import { USERS } from './data';
import { UsersTable } from './UsersTable';

configure({ lang: 'ru' });

export function App() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <UsersTable data={USERS} />
    </div>
  );
}
