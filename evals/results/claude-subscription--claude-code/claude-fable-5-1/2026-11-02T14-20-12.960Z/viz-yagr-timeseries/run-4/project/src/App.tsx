import type {Theme} from '@gravity-ui/uikit';

import {MonitoringPage} from './monitoring/MonitoringPage';

export interface AppProps {
  onThemeChange?: (theme: Theme) => void;
}

export function App({onThemeChange}: AppProps) {
  return <MonitoringPage onThemeChange={onThemeChange} />;
}
