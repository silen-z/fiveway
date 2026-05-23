---
outline: deep
---

# Getting started

Install the core library and frameworks integration:

::: code-group

```sh [React]
npm install @fiveway/react
```

```sh [SolidJS]
npm install @fiveway/solid
```

:::

Create a navigation tree and provide it to the application:

::: code-group

```tsx [React]
import { createNavigationTree, NavigationRoot } from "@fiveway/react";

const navtree = createNavigationTree();

function App() {
	return <NavigationRoot tree={navtree}>{/* rest of your app */}</NavigationRoot>;
}

ReactDOM.createRoot(rootElement).render(<App />);
```

```tsx [SolidJS]
import { createNavigationTree, NavigationRoot } from "@fiveway/solid";
import { render } from "solid-js/web";

function App() {
	const navtree = createNavigationTree();

	return <NavigationRoot tree={navtree}>{/* rest of your app */}</NavigationRoot>;
}

render(App, rootElement);
```

:::

Now your components can become navigation nodes:

::: code-group

```jsx [React]
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

```jsx [SolidJS]
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

:::
