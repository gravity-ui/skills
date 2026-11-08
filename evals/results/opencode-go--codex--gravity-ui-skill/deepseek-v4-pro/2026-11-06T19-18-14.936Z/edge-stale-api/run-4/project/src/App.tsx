import {Button, Icon, useThemeType} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';
import type {Theme} from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: Theme) => void;
}

export function App({onThemeChange}: AppProps) {
  const themeType = useThemeType();
  const isLight = themeType === 'light';

  const handleToggle = () => {
    onThemeChange(isLight ? 'dark' : 'light');
  };

  return (
    <div style={{padding: 24}}>
      <Button view="outlined" onClick={handleToggle}>
        <Button.Icon>
          <Icon data={isLight ? Moon : Sun} size={16} />
        </Button.Icon>
        {isLight ? 'Тёмная тема' : 'Светлая тема'}
      </Button>
    </div>
  );
}
