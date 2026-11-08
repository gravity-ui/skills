import React from 'react';
import { Box, Flex, Text } from '@gravity-ui/uikit';

interface PageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Common page frame: padded, width-limited column with a header-1 title. */
export function Page({ title, description, children }: PageProps) {
  return (
    <Box spacing={{ p: 6 }} maxWidth={960}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <Text variant="header-1" as="h1" style={{ margin: 0 }}>
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
