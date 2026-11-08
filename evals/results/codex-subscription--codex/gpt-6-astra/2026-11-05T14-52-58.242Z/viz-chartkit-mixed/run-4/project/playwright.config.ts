import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: {baseURL:'http://localhost:4197',viewport:{width:1440,height:1050},headless:true},
  webServer: {command:'npm run build && npx vite preview --host 0.0.0.0 --port 4197',port:4197,reuseExistingServer:false},
});
