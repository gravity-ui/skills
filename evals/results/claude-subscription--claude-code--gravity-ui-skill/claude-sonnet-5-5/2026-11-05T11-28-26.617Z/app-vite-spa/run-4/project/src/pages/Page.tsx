import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

interface PageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Page({title, description, children}: PageProps) {
  return (
    <Flex direction="column" gap={5} style={{padding: 'var(--g-spacing-6)', maxWidth: 960}}>
      <Flex direction="column" gap={1}>
        <Text variant="header-1">{title}</Text>
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
