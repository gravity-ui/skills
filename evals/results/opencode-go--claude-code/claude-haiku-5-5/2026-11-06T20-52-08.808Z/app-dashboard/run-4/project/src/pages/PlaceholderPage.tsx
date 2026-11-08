import { Text } from '@gravity-ui/uikit';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <Text variant="body-2" color="secondary">
        Раздел в разработке.
      </Text>
    </>
  );
}
