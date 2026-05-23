# fiveway

**fiveway** is a TypeScript library for rich web applications that need to
support keyboard navigation and require precise control over what is focused.
It comes with a set of default behaviors and allows for extensive customization.

## Features

- 🧱 **Composable** — designed with components, local reasoning and composition in mind
- 🔌 **Extensible** — fully customize behavior via advanced middleware-like handler system
- 🌈 **Framework agnostic** — use it in your favorite framework - React, SolidJS and more to come

## @fiveway/solid

This package contains the SolidJS version of the library.

### Getting started

Install the SolidJS version of the library:

```sh
npm install @fiveway/solid
```

Create a navigation tree and provide it to the application:

```tsx
import { createNavigationTree, NavigationRoot } from "@fiveway/solid";
import { render } from "solid-js/web";

function App() {
	const navtree = createNavigationTree();

	return <NavigationRoot tree={navtree}>{/* rest of your app */}</NavigationRoot>;
}

render(App, rootElement);
```

Now your components can become navigation nodes:

```tsx
import { createNavnode, horizontalHandler } from "@fiveway/solid";
import { For } from "solid-js";

const items = [
	{ id: "1", label: "One" },
	{ id: "2", label: "Two" },
	{ id: "3", label: "Three" },
];

function List() {
	const nav = createNavnode("list", horizontalHandler);

	return (
		<nav.Context>
			<ul>
				<For each={items}>{(item, i) => <Item item={item} order={i()} />}</For>
			</ul>
		</nav.Context>
	);
}

function Item(props) {
	const nav = createNavnode(props.item.id, undefined, {
		get order() {
			return props.order;
		},
	});

	return <li classList={{ focused: nav.isFocused() }}>{props.item.label}</li>;
}
```

Check out the full guide at: https://fiveway.dev/getting-started
