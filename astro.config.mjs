import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://aas-bacac.github.io',
  integrations: [react()],
  base: process.env.BASE_PATH || '/',
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
});