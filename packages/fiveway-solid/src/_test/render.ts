import { type NavigationTree, holdFocus } from "@fiveway/core";
import { render } from "@solidjs/testing-library";
import { type JSX } from "@solidjs/web";

export function renderWithFocusLock(
	tree: NavigationTree,
	component: () => JSX.Element,
): ReturnType<typeof render> {
	const releaseFocus = holdFocus(tree)!;
	const result = render(component);
	releaseFocus();
	return result;
}
