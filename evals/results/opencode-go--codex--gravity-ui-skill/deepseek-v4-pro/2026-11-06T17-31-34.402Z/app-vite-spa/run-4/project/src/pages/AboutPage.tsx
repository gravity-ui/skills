import { Box, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Box spacing={{p: 4}}>
      <Text variant="header-1" as="h1">
        About
      </Text>
      <Box spacing={{mt: 4}}>
        <Text variant="body-1">
          This is a small demo application built with{' '}
          <Text variant="body-1" color="brand" as="span">
            @gravity-ui/uikit
          </Text>
          , featuring tab navigation and a light/dark theme switcher.
        </Text>
      </Box>
    </Box>
  );
}
