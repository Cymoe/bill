// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	site: 'https://billbreeze.com',
	base: '/blog',
	integrations: [mdx(), sitemap(), tailwind()],
	server: {
		port: 4321,
		host: true
	},
	devToolbar: {
		enabled: false // Disable dev toolbar to avoid proxy issues
	},
	vite: {
		server: {
			watch: {
				usePolling: true
			}
		}
	}
});
