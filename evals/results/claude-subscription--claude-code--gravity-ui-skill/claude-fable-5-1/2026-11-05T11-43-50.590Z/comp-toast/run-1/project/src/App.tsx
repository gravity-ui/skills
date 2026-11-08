import { Box, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';

import { NotifyButton } from './NotifyButton';

// A single toaster instance shared by the whole app
const toaster = new Toaster();

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <Box spacing={{ p: 6 }}>
        <NotifyButton />
      </Box>
      {/* Renders the toast stack in the corner of the screen */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
