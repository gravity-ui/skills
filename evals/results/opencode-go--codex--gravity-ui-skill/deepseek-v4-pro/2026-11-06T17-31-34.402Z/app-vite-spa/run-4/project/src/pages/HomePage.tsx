import { Box, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Box spacing={{p: 4}}>
      <Text variant="header-1" as="h1">
        Home
      </Text>
      <Box spacing={{mt: 4}}>
        <Text variant="body-1">
          Welcome to the Gravity UI demo app. Use the tabs above to navigate
          between pages and try the theme toggle in Settings.
        </Text>
      </Box>
    </Box>
  );
}
