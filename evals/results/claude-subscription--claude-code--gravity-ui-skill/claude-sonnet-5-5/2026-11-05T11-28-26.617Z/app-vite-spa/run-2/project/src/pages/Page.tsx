import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

interface PageProps extends React.PropsWithChildren {
  title: string;
  description?: string;
}

export function Page({title, description, children}: PageProps) {
  return (
    <Flex direction="column" gap={5} style={{padding: 'var(--g-spacing-6)', maxWidth: 960}}>
      <Flex direction="column" gap={1}>
        <Text variant="header-1" as="h1">
          {title}
        </Text>
        {description ? (
          <Text variant="body-2" color="secondary">
            {description}
          </Text>
        ) : null}
      </Flex>
      {children}
    </Flex>
  );
}
