# What is fiveway?

**fiveway** is a TypeScript library for rich web applications that need to
support keyboard navigation and require precise control over what is focused.
It comes with a set of default behaviors and allows for extensive customization.

## How it works

### Navigation tree & nodes

fiveway works with navigation nodes organized into a navigation tree.
Although nodes have no specific type, we can think of most of them as:

- **items** that represent focusable pieces of UI
- **containers** that contain any number of item and container nodes

In typical frontend frameworks, components like `<Sidebar/>` or `<List/>`
would become container nodes. Components like `<Button/>` are examples of item nodes.

### Focus

fiveway keeps track of a focused node at all times. When a navigation tree is created, its root node becomes focused.
By default, fiveway tries to move focus into item nodes when they are inserted into the tree.
When a focused node is removed, fiveway searches upwards for a new node to focus.
Focus behavior can be extended using handlers.

### Handlers and actions

Handlers, along with nodes, are the core of fiveway. Every node has an associated handler that defines its behavior.
In their simplest form, handlers are just functions that accept **actions** and return node IDs. fiveway provides a set of handlers for common scenarios.
These handlers can be composed together with custom handlers to create unique custom behavior.

When given an action, the navigation tree passes that action to the focused node and its handler. The handler can either return a node that should get focused
or pass the action to another (usually parent) node and its handler.

### IDs

Every node has a unique ID. The full ID looks something like this:

```
#/layout/content/login-form/submit-button
```

This URL-like format contains IDs of parent nodes up to the root, which is denoted as `#`.
Most of the time, you will work with local and relative IDs. For example, in component frameworks,
when creating a node, you only need to provide a local ID, and the parent is usually deduced from context.

### Integrations

fiveway is designed to work with component-based UI frameworks such as React, SolidJS, Vue, Svelte, and others.
Currently, it provides first-party integration for:

- React
- SolidJS
