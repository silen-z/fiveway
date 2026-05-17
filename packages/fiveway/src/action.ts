// https://github.com/oxc-project/oxc/issues/11639
// oxlint-disable no-unused-vars
import { type NavigationHandler } from "./handler/handler.ts";
import { createDataHandler } from "./handler/metadata.ts";
// oxlint-enable no-unused-vars

/**
 * Basic movement directions.
 */
export type NavigationDirection = "up" | "down" | "left" | "right";

/**
 * Action dispatched to check which node to potentially focus.
 *
 * Receiving this action does not guarantee that the node will be focused,
 * only that other nodes are interested if it or its children can be focused.
 *
 * Focus action can contain direction of movement.
 */
export type FocusAction = {
	kind: "focus";
	direction: NavigationDirection | "initial" | null;
};

/**
 * Action dispatched to move focus in a specific direction.
 */
export type MoveAction = {
	kind: "move";
	direction: NavigationDirection | "back";
};

/**
 * Action dispatched to select a node.
 */
export type SelectAction = {
	kind: "select";
};

/**
 * Action dispatched to query node metadata based on key.
 *
 * This action is meant to be used via the `.query()` method on handlers from {@link createDataHandler}.
 * QueryAction is resolved directly on given node and is not passed to parent nodes.
 */
export type QueryAction = {
	kind: "query";
	key: string;
	value: unknown;
};

/**
 * Extension point for registering custom actions.
 *
 * Custom actions can be defined by extending this interface with a new property:
 *
 * ```ts
 * declare module "@fiveway/core" {
 * 	interface DefinedNavigationActions {
 * 		["library:action"]: { kind: "library:action"; ... };
 * 	}
 * }
 * ```
 *
 * This type is only for registering custom actions. For typing handlers use {@link NavigationAction}.
 */
export interface DefinedNavigationActions {
	focus: FocusAction;
	move: MoveAction;
	select: SelectAction;
	query: QueryAction;
}

/**
 * Type of actions dispatched to nodes in navigation tree and handled by node handlers.
 *
 * @see {@link NavigationHandler}.
 * @see {@link DefinedNavigationActions} to extend this type with custom actions.
 */
export type NavigationAction = DefinedNavigationActions[keyof DefinedNavigationActions];
