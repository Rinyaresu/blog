import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  site: "https://rinyaresu.me",
  integrations: [mdx(), sitemap()],
  output: "static",
  adapter: vercel(),

  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});