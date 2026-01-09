import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import netlify from "@astrojs/netlify";

import react from "@astrojs/react";

export default defineConfig({
  integrations: [tailwind(), mdx(), sitemap(), icon(), react()],

  i18n: {
    defaultLocale: "en",
    locales: ["en", "pl"],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  adapter: netlify(),
});