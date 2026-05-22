import { type NavigationTree, type NodeId } from "@fiveway/core";
import { defaultKeybinds, registerKeyboardListener, type Keybinds } from "@fiveway/core/dom";
import { type Context, type ReactNode, createContext, useContext, useEffect } from "react";

export type NavigationContext = {
	tree: NavigationTree;
	parentNode: NodeId;
};

export const NavigationContext: Context<NavigationContext | null> =
	createContext<NavigationContext | null>(null);

export function useNavigationContext(): NavigationContext {
	const navContext = useContext(NavigationContext);
	if (navContext == null) {
		throw new Error("expected navigation context");
	}

	return navContext;
}

export function NavigationProvider(props: {
	tree: NavigationTree;
	children?: ReactNode;
	listener?: EventTarget | null;
	keybinds?: Keybinds;
}): ReactNode {
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
