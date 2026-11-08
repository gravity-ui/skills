import {SalesWidget} from './widget/SalesWidget';

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 860, margin: '0 auto'}}>
      <h2 style={{margin: '0 0 16px', fontWeight: 600, fontSize: 20}}>Виджет продаж / мониторинга</h2>
      <SalesWidget />
    </div>
  );
}
