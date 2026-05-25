import { type NavigationTree, type NodeId } from "@fiveway/core";
import { defaultKeybinds, type Keybinds, registerKeyboardListener } from "@fiveway/core/dom";
import {
	createContext,
	useContext,
	createEffect,
	onCleanup,
	type Context,
	type JSX,
} from "solid-js";

/**
 * Context type containing navigation tree and current parent node.
 *
 * @see {@link useNavigationContext}
 * @see {@link NavigationRoot}
 */
export type NavigationContext = {
	tree: NavigationTree;
	parentNode: () => NodeId;
};

/**
 * Solid context for navigation.
 *
 * @see {@link useNavigationContext}
 * @see {@link NavigationRoot}
 */
export const NavigationContext: Context<NavigationContext | undefined> =
	createContext<NavigationContext>();

/**
 * Primitive that reads {@link NavigationContext}.
 */
export function useNavigationContext(): NavigationContext {
	const navContext = useContext(NavigationContext);
	if (navContext == null) {
		throw new Error("expected navigation context");
	}

	return navContext;
}

/**
 * Props for the {@link NavigationRoot} component.
 */
export interface NavigationRootProps {
	tree: NavigationTree;

	/**
	 * Event target to attach listeners on.
	 * When set to `null` no listeners are attached. Default: `window`.
	 */
	listener?: EventTarget | null;

	/**
	 * Keybinds to use for mapping events to navigation actions.
	 */
	keybinds?: Keybinds;

	children: JSX.Element;
}

/**
 * Solid component that provides navigation context and attaches keyboard listeners for dispatching navigation actions.
 *
 * By default listeners are attached to `window` and use {@link defaultKeybinds} to map events to navigation actions.
 *
 * @see {@link NavigationRootProps} for configuration options
 *
 * @example
 * ```tsx
 * const tree = createNavigationTree();
 *
 * <NavigationRoot tree={tree}>
 * 	<App />
 * </NavigationRoot>
 * ```
 */
export function NavigationRoot(props: NavigationRootProps): JSX.Element {
	// reactive tree prop is not supported
	// eslint-disable-next-line solid/reactivity
	const tree = props.tree;

	createEffect(() => {
		if (props.listener === null) {
			return;
		}

		const cleanupListener = registerKeyboardListener(
			tree,
			props.listener ?? window,
			props.keybinds ?? defaultKeybinds,
		);

		onCleanup(() => {
			cleanupListener();
		});
	});

	return (
		<NavigationContext.Provider value={{ tree, parentNode: () => "#" }}>
			{props.children}
		</NavigationContext.Provider>
	);
}
