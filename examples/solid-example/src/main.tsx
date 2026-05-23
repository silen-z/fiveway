/* @refresh reload */

import { createNavigationTree, NavigationRoot } from "@fiveway/solid";
import { render } from "@solidjs/web";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";

function App() {
	const navigationTree = createNavigationTree();

	return (
		<NavigationRoot tree={navigationTree}>
			<Showcase />
		</NavigationRoot>
	);
}

const root = document.createElement("div");
document.body.appendChild(root);

render(App, root);
