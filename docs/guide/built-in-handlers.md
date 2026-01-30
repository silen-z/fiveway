# Built-in handlers

Fiveway contains a set of built-in handlers for common scenarios. These can be used as building blocks and further extended.

## Basic handlers

These are the most commonly used handlers that provide basic navigation functionality.

### Default handler

```ts
import { defaultHandler, createNode } from "@fiveway/core";

const node = createNode({
  id: "node",
  parent: "#",
  handler: defaultHandler,
});
```

`defaultHandler` is used by default when you don't specify a handler for the node.
It allows the node to be focused but passes all movement actions to its parent.
Together with `containerHandler`, it's the ideal handler to extend with custom movement behavior.

### Container handler

```ts
import { containerHandler, createNode } from "@fiveway/core";

const node = createNode({
  id: "node",
  parent: "#",
  handler: containerHandler,
});
```

The `containerHandler` passes movement actions to its parent just like `defaultHandler`.
The difference is that it does not allow its node to be focused if it's a leaf node.
Together with `defaultHandler`, it's the ideal handler to extend with custom movement behavior.

### Item handler

```ts
import { itemHandler, createNode } from "@fiveway/core";

const node = createNode({
  id: "node",
  parent: "#",
  handler: itemHandler(() => {
    console.log("Item selected!");
  }),
});
```

The `itemHandler` is just like `defaultHandler` but it also allows you to optionally specify a callback function that will be called when the node receives a select action.

## Movement handlers

Movement handlers are handlers with predefined movement behavior. There are a few of them for the most common scenarios, but they can still be extended.

### Vertical handler

```ts
import { verticalHandler } from "@fiveway/core";
```

The `verticalHandler` provides up/down navigation. It focuses on the first child when entering and moves between children in vertical order.

### Horizontal handler

```ts
import { horizontalHandler } from "@fiveway/core";
```

The `horizontalHandler` provides left/right navigation. It focuses on the first child when entering and moves between children in horizontal order.

### Grid handler

The grid handler provides navigation based on a 2D grid layout.

```ts
import { gridHandler, gridItemHandler } from "@fiveway/core";

// Set grid position for a node
gridItemHandler({ row: 0, col: 0 })(nodeHandler);

// Create grid navigation handler
const handler = gridHandler();
```

The `gridHandler` finds the closest node in the direction of movement based on grid positions. Each node needs to have its grid position set using `gridItemHandler`.

### Spatial handler

The spatial handler provides navigation based on actual DOM element positions.

```ts
import { spatialHandler, spatialItemHandler } from "@fiveway/core";

// Set spatial position for a node
spatialItemHandler(element.getBoundingClientRect())(nodeHandler);

// Create spatial navigation handler
const handler = spatialHandler();
```

The `spatialHandler` finds the closest node in the direction of movement based on actual DOM element positions. Each node needs to have its position set using `spatialItemHandler`.

## Primitive handlers

These handlers are the building blocks of the library.

## Focus handler

The focus handler might be the most important handler (and the most complicated one). It manages how focus is distributed among child nodes.

```ts
import { focusHandler } from "@fiveway/core";

const handler = focusHandler({
  skipEmpty: true,
  direction: (dir) => {
    // Custom focus direction logic
    return dir === "up" ? "back" : "front";
  },
});
```

The `focusHandler` can be configured to:

- Skip empty nodes when focusing
- Use custom focus direction logic
- Control which child gets focused when entering a node

## Select handler

The select handler provides selection functionality.

```ts
import { selectHandler } from "@fiveway/core";

const handler = selectHandler(() => {
  console.log("Node selected!");
});
```

The `selectHandler` calls the provided callback function when the node receives a select action.

## Parent handler

The parent handler passes unhandled actions to the parent node.

```ts
import { parentHandler } from "@fiveway/core";
```

The `parentHandler` passes unhandled actions to the parent node, allowing actions to bubble up the navigation tree.

### Directional movement handlers

```ts
import { verticalMovementHandler, horizontalMovementHandler } from "@fiveway/core";
```

These are the primitive movement handlers that can be composed with other handlers. They handle the actual movement logic for their respective directions.
