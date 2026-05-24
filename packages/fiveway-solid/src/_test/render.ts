import { type NavigationTree, holdFocus } from "@fiveway/core";
import { type JSX } from "solid-js";
import { render, type RenderResult } from "vitest-browser-solid";

export function renderWithFocusLock(
	tree: NavigationTree,
	component: () => JSX.Element,
): RenderResult {
	const releaseFocus = holdFocus(tree)!;
	const result = render(component);
	releaseFocus();
	return result;
}
