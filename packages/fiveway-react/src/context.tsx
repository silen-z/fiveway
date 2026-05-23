import { type NavigationTree, type NodeId } from "@fiveway/core";
import { defaultKeybinds, registerKeyboardListener, type Keybinds } from "@fiveway/core/dom";
import { type Context, type ReactNode, createContext, useContext, useEffect } from "react";

/**
 * Context type containing navigation tree and current parent node.
 *
 * @see {@link useNavigationContext}
 * @see {@link NavigationRoot}
 */
export type NavigationContext = {
	tree: NavigationTree;
	parentNode: NodeId;
};

/**
 * React context for navigation
 *
 * @see {@link useNavigationContext}
 * @see {@link NavigationRoot}
 */
export const NavigationContext: Context<NavigationContext | null> =
	createContext<NavigationContext | null>(null);

/**
 * Hook that reads {@link NavigationContext}.
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
	 * When set to `null` no listeners are attached.
	 * @default `window`
	 */
	listener?: EventTarget | null;

	/**
	 * Keybinds to use for mapping events to navigation actions.
	 */
	keybinds?: Keybinds;

	children?: ReactNode;
}

/**
 * React component that provides navigation context and attaches keyboard listeners for dispatching navigation actions.
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
export function NavigationRoot(props: NavigationRootProps): ReactNode {
	useEffect(() => {
		if (props.listener === null) {
			return;
		}

		return registerKeyboardListener(
			props.tree,
			props.listener ?? window,
			props.keybinds ?? defaultKeybinds,
		);
	}, [props.tree, props.listener, props.keybinds]);

	return (
		<NavigationContext.Provider value={{ tree: props.tree, parentNode: "#" }}>
			{props.children}
		</NavigationContext.Provider>
	);
}
