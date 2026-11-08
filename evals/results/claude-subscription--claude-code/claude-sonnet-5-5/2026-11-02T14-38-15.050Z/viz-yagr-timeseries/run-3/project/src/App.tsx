import {MonitoringPage} from './monitoring/MonitoringPage';

export type AppProps = React.ComponentProps<typeof MonitoringPage>;

export function App(props: AppProps) {
  return <MonitoringPage {...props} />;
}
