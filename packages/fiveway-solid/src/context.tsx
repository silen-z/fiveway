import { type NavigationTree, type NodeId } from "@fiveway/core";
import { createContext, useContext, type Context, type JSX } from "solid-js";

export type NavigationContext = {
	tree: NavigationTree;
	parentNode: () => NodeId;
};

export const NavigationContext: Context<NavigationContext | undefined> =
	createContext<NavigationContext>();

export function NavigationProvider(props: {
	tree: NavigationTree;
	children: JSX.Element;
}): JSX.Element {
	// reactive tree prop is not supported
	// eslint-disable-next-line solid/reactivity
	const tree = props.tree;

	return (
		<NavigationContext.Provider value={{ tree, parentNode: () => "#" }}>
			{props.children}
		</NavigationContext.Provider>
	);
}

export function useNavigationContext(): NavigationContext {
	const navContext = useContext(NavigationContext);
	if (navContext == null) {
		throw new Error("expected navigation context");
	}

	return navContext;
}
