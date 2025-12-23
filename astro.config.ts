// @ts-check
import react from "@astrojs/react";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.CF_PAGES
  ? "https://zhangt-ai.pages.dev"
    : process.env.HOSTNAME === "dmit"
      ? "https://zhangt.ai"
      : "http://localhost:4321";
const base = process.env.BASE || "/";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ["zhangtai.oss-cn-guangzhou.aliyuncs.com"],
  }
});
