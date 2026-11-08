import {
  PageConstructor,
  PageConstructorProvider,
  Theme,
  type PageContent,
} from '@gravity-ui/page-constructor';

const content = {
  blocks: [
    {
      type: 'hero-block',
      fullWidth: true,
      overtitle: 'Team time tracking',
      title: 'See where every team minute goes',
      text: 'A compact workspace for tracking shared work, leave, and sessions without spreadsheet friction.',
    },
    {
      type: 'extended-features-block',
      title: {
        text: 'Built for focused teams',
      },
      items: [
        {
          title: 'Shared time views',
          text: 'See workload and availability across the whole team in one compact view.',
        },
        {
          title: 'Fast weekly entries',
          text: 'Log recurring activities with templates and quick weekly data entry.',
        },
        {
          title: 'Clear project totals',
          text: 'Turn tracked minutes into simple totals you can review with confidence.',
        },
      ],
    },
    {
      type: 'banner-block',
      title: 'Start tracking time together',
      subtitle: 'Create a shared workspace in a few clicks—no credit card required.',
      button: {
        text: 'Get started',
        url: '#get-started',
        theme: 'action',
      },
    },
  ],
} satisfies PageContent;

export function App() {
  return (
    <PageConstructorProvider theme={Theme.Light}>
      <PageConstructor content={content} />
    </PageConstructorProvider>
  );
}
