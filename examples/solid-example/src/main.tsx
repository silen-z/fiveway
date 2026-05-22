/* @refresh reload */

import { createNavigationTree, NavigationProvider, useFocusSync } from "@fiveway/solid";
import { render } from "solid-js/web";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";

function App() {
	const navigationTree = createNavigationTree();

	useFocusSync(navigationTree);

	return (
		<NavigationProvider tree={navigationTree}>
			<Showcase />
		</NavigationProvider>
	);
}

const root = document.createElement("div");
document.body.appendChild(root);

render(App, root);
