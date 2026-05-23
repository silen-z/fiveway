import { createNavigationTree, NavigationRoot } from "@fiveway/react";
import React from "react";
import ReactDOM from "react-dom/client";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";
// import { Items } from "./Benchmark.tsx";

const navigationTree = createNavigationTree();

function App() {
	return (
		<NavigationRoot tree={navigationTree}>
			<Showcase />
		</NavigationRoot>
	);
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
