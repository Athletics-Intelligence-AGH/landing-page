import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";

import react from "@astrojs/react";

export default defineConfig({
  output: 'server',
  adapter: vercel(),

  integrations: [mdx(), sitemap(), icon(), react()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    routing: {
      prefixDefaultLocale: true
    }
  },

  security: {
    csp: true
  }
});