import { Text } from '@gravity-ui/uikit';

interface PlaceholderPageProps {
  title: string;
}

/** Stub for sections that aren't built yet. */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="page">
      <header className="page-header">
        <Text variant="header-2">{title}</Text>
      </header>
      <Text variant="body-1" color="secondary">
        Раздел в разработке.
      </Text>
    </section>
  );
}
