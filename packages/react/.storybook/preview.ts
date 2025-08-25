import "../src/styles/base.scss";

//Global preview - load SCSS once for all stories.
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
	parameters: {
		controls: { expanded: true },
		layout: "fullscreen",
	},
};
export default preview;
