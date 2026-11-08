import React from 'react';
import {Box, Flex, Text} from '@gravity-ui/uikit';

interface PageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Common page frame: padding, title and content column. */
export function PageShell({title, description, children}: PageShellProps) {
  return (
    <Box as="main" spacing={{p: 6}} maxWidth={960} style={{minWidth: 0}}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <Text as="h1" variant="header-2">
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
    </Box>
  );
}
