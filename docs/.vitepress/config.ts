import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "fiveway",
	description:
		"TypeScript library for rich web applications that want to support keyboard navigation and have precise control over what is focused",
	cleanUrls: true,
	themeConfig: {
		search: {
			provider: "local",
		},
		logo: { src: "/logo-small.png", width: 24, height: 24 },

		nav: [
			{ text: "Guide", link: "/what-is-fiveway" },
			{ text: "API", link: "/api/" },
			{ text: "React demo", link: "https://react.fiveway.dev" },
			{ text: "Solid demo", link: "https://solid.fiveway.dev" },
		],

		sidebar: {
			"/": [
				{
					text: "Introduction",
					items: [
						{ text: "What is fiveway?", link: "/what-is-fiveway" },
						{ text: "Getting started", link: "/getting-started" },
					],
				},
				{
					text: "Guide",
					items: [
						{ text: "Navigation tree", link: "/guide/navtree" },
						{ text: "Handlers", link: "/guide/handlers" },
						{ text: "Built-in handlers", link: "/guide/built-in-handlers" },
					],
				},
				{
					text: "Reference",
					items: [{ text: "API reference", link: "/api/" }],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/silen-z/fiveway" },
			{
				icon: "bluesky",
				link: "https://bsky.app/profile/fiveway.dev",
				ariaLabel: "Bluesky",
			},
		],
	},
	head: [["link", { rel: "icon", type: "image/png", href: "/logo-small.png" }]],
});
