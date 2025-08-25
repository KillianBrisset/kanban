import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	addons: ["@storybook/addon-links", "@storybook/addon-themes"],
	framework: {
		name: "@storybook/react-vite",

		options: {},
	},
	docs: {
		docsMode: true,
		defaultName: "Documentation",
	},
};
export default config;
