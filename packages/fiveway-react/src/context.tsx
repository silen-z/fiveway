import { type NavigationTree, type NodeId } from "@fiveway/core";
import { type Context, type ReactNode, createContext, useContext } from "react";

export type NavigationContext = {
	tree: NavigationTree;
	parentNode: NodeId;
};

export const NavigationContext: Context<NavigationContext | null> =
	createContext<NavigationContext | null>(null);

export function NavigationProvider(props: {
	tree: NavigationTree;
	children?: ReactNode;
}): ReactNode {
	return (
		<NavigationContext.Provider value={{ tree: props.tree, parentNode: "#" }}>
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
