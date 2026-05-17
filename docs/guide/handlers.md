# Handlers

Every node in a navigation tree has a handler that determines its behavior. The handler responds to actions and indicates where focus should move.

At its core, a handler is a function that runs every time a node receives an action.
The handler function is defined like this:

```ts
export type NavigationHandler = (
	node: NavigationNode,
	action: NavigationAction,
	next: (id?: NodeId, action?: NavigationAction) => NodeId | null,
) => NodeId | null;
```

### Parameters

- **`node`** - the current node on which an action was executed
- **`action`** - the action to handle (e.g., _move up_)
- **`next`** - a function for passing the action to the next handler; it can optionally be given a different `NodeId` and action

### Return value

A handler can return a `NodeId` that indicates where the focus should move next.
Not all handlers need to do this. They can return `null`, which means that focus should remain in the same place.

### Example

Here is an example of a handler that handles `focus` and `move` actions and passes the rest to the next handler:

```ts
function exampleHandler(
	node: NavigationNode,
	action: NavigationAction,
	next: HandlerNext,
): NodeId | null {
	if (action.kind === "focus") {
		// handle focus
	}

	if (action.kind === "move") {
		// handle movement
	}

	// pass action to next handler in line
	return next();
}
```

## Composing handlers

Handling all the different action types in a single function would become messy very quickly.
That's why it's possible to compose multiple primitive handlers together and create more complex ones that handle multiple actions.
The key to this is the `next` function. It can pass an action to the next handler in line, similar to middleware in a web framework.

### Extending built-in handlers

Built-in handlers can be extended to add additional functionality or modify the current behavior.
The simplest way to do this is by composing a handler onto an existing one with `.compose()`:

```ts
import { defaultHandler } from "@fiveway/core";

// defaultHandler is a basic composed handler
// that can be extended with custom functionality
const customHandler = defaultHandler.compose((node, action, next) => {
	if (action.kind === "move" && action.direction === "up") {
		console.log("moving up");
	}

	return next(); // pass action to next handler in line
});
```

This creates a new handler called `customHandler` that prints 'moving up' in response to the move up action
and passes it to the next handler in line, in this case the `defaultHandler`.

### Creating composed handlers from primitive ones

Sometimes you might want to create a completely new handler by combining multiple primitive handlers together. This is a more advanced approach used by the library itself.

```ts
export const horizontalHandler = composeHandlers([
	focusHandler({ focusWhenEmpty: false, direction: horizontalFocusDirection }),
	horizontalMovementHandler,
	parentHandler,
]);
```

Most of the built-in handlers are composed from these three primitive handlers:

- **`focusHandler`** - handles `focus` actions
- **`movementHandler`** - in this case `horizontalMovementHandler` that handles `move` actions
- **`parentHandler`** - passes unhandled actions to the parent node
