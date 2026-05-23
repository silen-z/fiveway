import { type NavigationTree, holdFocus } from "@fiveway/core";
import { render } from "@solidjs/testing-library";
import { type JSX } from "@solidjs/web";

export function renderWithFocusLock(
	tree: NavigationTree,
	component: () => JSX.Element,
): Unbound<ReturnType<typeof render>> {
	const releaseFocus = holdFocus(tree)!;
	const result = render(component);
	releaseFocus();
	return result;
}

// assume the return type of render function doesn't use `this`
// to prevent `typescript(unbound-method)` warning
type Unbound<T> = {
	[K in keyof T]: T[K] extends (...args: infer A) => infer R ? (this: void, ...args: A) => R : T[K];
};
