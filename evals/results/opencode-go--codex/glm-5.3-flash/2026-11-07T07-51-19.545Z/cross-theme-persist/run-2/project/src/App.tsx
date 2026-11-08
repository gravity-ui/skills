import { useState } from 'react';
import { ThemeProvider, RadioGroup } from '@gravity-ui/uikit';

import { Theme, readStoredTheme, storeTheme } from './theme';

export function App() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme());

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    storeTheme(nextTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <RadioGroup
          value={theme}
          onChange={(event) => changeTheme(event.target.value as Theme)}
        >
          <RadioGroup.Option value="light">Light</RadioGroup.Option>
          <RadioGroup.Option value="dark">Dark</RadioGroup.Option>
        </RadioGroup>
      </div>
    </ThemeProvider>
  );
}
