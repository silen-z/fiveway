# Node structure

fiveway works with navigation nodes composed into a navigation tree.
Although nodes have no specific node type, we can think about most of them as:

- **items** that represent a focusable piece of UI
- **containers** that contain any number of item and container nodes

In your typical frontend framework some of your components like `<Sidebar/>` or `<List/>`
would become container nodes. Component like `<Button/>` is an example of item node.

Nodes inside a container are ordered either by time of insertion or by explicit `order` property.
