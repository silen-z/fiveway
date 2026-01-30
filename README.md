# fiveway

**fiveway** is a TypeScript library for rich web applications that need to
support keyboard navigation and require precise control over what is focused.
It comes with a set of default behaviors and allows for extensive customization.


## Features

- 🚀 **Ready to go** — Rich set of premade behaviors for common scenarios and robust defaults
- 🧱 **Composable** — Designed with components, local reasoning and composition in mind
- 🔌 **Extensible** — Fully customize behavior via advanced middleware-like handler system
- 🌈 **Framework agnostic** — Available for React and SolidJS (more coming in the future)

---

## Getting started

Install the core library and React integration:

```sh
npm install @fiveway/core @fiveway/react
```

Create a navigation tree and provide it to the application:

```tsx
import { createNavigationTree } from "@fiveway/core";
import { NavigationProvider, useActionHandler } from "@fiveway/react";

const navtree = createNavigationTree();

function App() {
  // register keyboard listeners (by default on window)
  useActionHandler(navtree);

  return (
    <NavigationProvider tree={navtree}>
      {/* rest of your app */}
    </NavigationProvider>
  );
}

ReactDOM.createRoot(rootElement).render(<App />);
```

Now your components can become navigation nodes:

```jsx
import { horizontalHandler } from "@fiveway/core";
import { useNavigationNode } from "@fiveway/react";

const items = [
  { id: "1", label: "One" },
  { id: "2", label: "Two" },
  { id: "3", label: "Three" },
];

function List() {
  const nav = useNavigationNode({ id: "list", handler: horizontalHandler });

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
  const nav = useNavigationNode({ id: props.item.id, order: props.order });

  return <li className={nav.isFocused() && "focused"}>{props.item.label}</li>;
}
```

## Packages

- **@fiveway/core** — Core library: navigation tree, nodes, handlers, actions, and DOM utilities
- **@fiveway/react** — React integration (NavigationProvider, useNavigationNode, useActionHandler)
- **@fiveway/solid** — SolidJS integration (NavigationProvider, useNavigationNode, useActionHandler)
- **@fiveway/devtools** — DevTools for inspecting and debugging the navigation tree in the browser
