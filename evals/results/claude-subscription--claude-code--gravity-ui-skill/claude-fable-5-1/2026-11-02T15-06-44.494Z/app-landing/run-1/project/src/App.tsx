import '@gravity-ui/page-constructor/styles/styles.scss';
import './landing.css';

import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';

import { content } from './content';

export function App() {
  return (
    <PageConstructorProvider locale={{ lang: 'ru' }}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
