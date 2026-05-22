# fiveway

**fiveway** is a TypeScript library for rich web applications that need to
support keyboard navigation and require precise control over what is focused.
It comes with a set of default behaviors and allows for extensive customization.

## Features

- 🧱 **Composable** — designed with components, local reasoning and composition in mind
- 🔌 **Extensible** — fully customize behavior via advanced middleware-like handler system
- 🌈 **Framework agnostic** — use it in your favorite framework - React, SolidJS and more to come

---

## Getting started

Install the React version of the library:

```sh
npm install @fiveway/react
```

Create a navigation tree and provide it to the application:

```tsx
import { createNavigationTree, NavigationProvider } from "@fiveway/react";

const navtree = createNavigationTree();

function App() {
	return <NavigationProvider tree={navtree}>{/* rest of your app */}</NavigationProvider>;
}

ReactDOM.createRoot(rootElement).render(<App />);
```

Now your components can become navigation nodes:

```tsx
import { useNavnode, horizontalHandler } from "@fiveway/react";

const items = [
	{ id: "1", label: "One" },
	{ id: "2", label: "Two" },
	{ id: "3", label: "Three" },
];

function List() {
	const nav = useNavnode("list", horizontalHandler);

	return (
		<nav.Context>
			<ul>
				{items.map((item, i) => (
					<Item key={item.id} item={item} order={i} />
				))}
			</ul>
		</nav.Context>
	);
}

function Item(props) {
	const nav = useNavnode(props.item.id, undefined, { order: props.order });

	return <li className={nav.isFocused() && "focused"}>{props.item.label}</li>;
}
```

Check out the full guide at: https://fiveway.io/getting-started

## Packages

- **@fiveway/core** — Core library: navigation tree, nodes, handlers, actions, and DOM utilities
- **@fiveway/react** — React integration (NavigationProvider, useNavnode)
- **@fiveway/solid** — SolidJS integration (NavigationProvider, createNavnode)
- **@fiveway/inspector** — Inspector UI for inspecting and debugging the navigation tree in the browser
