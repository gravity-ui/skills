import type { ReactNode } from 'react';
import { Box, Flex, Text } from '@gravity-ui/uikit';

export function PageContainer({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box spacing={{ p: 6 }} style={{ maxWidth: 960, margin: '0 auto' }}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <Text variant="header-2" as="h1" style={{ margin: 0 }}>
            {title}
          </Text>
          {description && (
            <Text variant="body-2" color="secondary">
              {description}
            </Text>
          )}
        </Flex>
        {children}
      </Flex>
    </Box>
  );
}
