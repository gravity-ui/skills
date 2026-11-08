import { Label, Text } from '@gravity-ui/uikit';

export function About() {
  return (
    <div className="page">
      <Text variant="display-1" as="h1">
        О проекте
      </Text>
      <Text variant="body-2" color="secondary" as="p">
        Демонстрационное SPA на React, Vite и Gravity UI.
      </Text>
      <div className="row">
        <Label theme="info">React 18</Label>
        <Label theme="success">Vite</Label>
        <Label theme="normal">Gravity UI</Label>
        <Label theme="unknown">TypeScript</Label>
      </div>
    </div>
  );
}
