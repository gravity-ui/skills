import { PageConstructor, PageConstructorProvider } from '@gravity-ui/page-constructor';

import { landingContent } from './content';

export function App() {
  return (
    <PageConstructorProvider>
      <PageConstructor content={landingContent} />
    </PageConstructorProvider>
  );
}
