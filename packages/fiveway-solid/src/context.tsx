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

export type NavigationContext = {
	tree: NavigationTree;
	parentNode: () => NodeId;
};

export const NavigationContext: Context<NavigationContext | undefined> =
	createContext<NavigationContext>();

export function useNavigationContext(): NavigationContext {
	const navContext = useContext(NavigationContext);
	if (navContext == null) {
		throw new Error("expected navigation context");
	}

	return navContext;
}

export function NavigationProvider(props: {
	tree: NavigationTree;
	children: JSX.Element;
	listener?: EventTarget | null;
	keybinds?: Keybinds;
}): JSX.Element {
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
