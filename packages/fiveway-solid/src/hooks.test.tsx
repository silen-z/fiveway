import {
	createNavigationTree,
	horizontalHandler,
	itemHandler,
	verticalHandler,
} from "@fiveway/core";
import { test, expect, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { renderWithFocusLock } from "./_test/render";
import { NavigationRoot } from "./context";
import {
	useActivate,
	useFocusedId,
	useFocus,
	useIsFocused,
	useOnBlur,
	useOnFocus,
	useOnFocusChange,
} from "./hooks";
import { Navnode, createNavnode } from "./node";

test("useFocusedId returns focus path when scope contains focus", async () => {
	const tree = createNavigationTree();

	const App = () => {
		const nav = createNavnode("app", verticalHandler);
		const focusedId = useFocusedId(nav());

		return (
			<nav.Context>
				<Item id="item1" />
				<Item id="item2" />
				<div data-testid="focused">{focusedId() ?? "none"}</div>
			</nav.Context>
		);
	};

	const { getByTestId } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<App />
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(getByTestId("focused")).toHaveTextContent("#/app/item1");

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	await expect.element(getByTestId("focused")).toHaveTextContent("#/app/item2");
});

test("useFocusedId returns null when scope does not contain focus", async () => {
	const tree = createNavigationTree();

	const { getByTestId } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="root" handler={horizontalHandler}>
				<Navnode id="app" handler={verticalHandler}>
					<Item id="item1" />
				</Navnode>
				<Navnode id="sidebar" handler={verticalHandler}>
					{(nav) => (
						<>
							<FocusIndicator scope={nav()} />
							<Item id="side1" />
						</>
					)}
				</Navnode>
			</Navnode>
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/root/app/item1");
	await expect.element(getByTestId("focused")).toHaveTextContent("none");
});

test("useIsFocused reflects focus inside node", async () => {
	const tree = createNavigationTree();

	const FocusableItem = (props: { id: string }) => {
		const nav = createNavnode(props.id, itemHandler());
		const focused = useIsFocused(nav());

		return <div class={focused() ? "focused" : ""}>{nav()}</div>;
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<FocusableItem id="item1" />
				<FocusableItem id="item2" />
			</Navnode>
		</NavigationRoot>
	));

	const item1 = getByText("item1");
	const item2 = getByText("item2");

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(item1).toHaveClass("focused");
	await expect.element(item2).not.toHaveClass("focused");

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	await expect.element(item1).not.toHaveClass("focused");
	await expect.element(item2).toHaveClass("focused");
});

test("useOnFocusChange reports focus changes", async () => {
	const tree = createNavigationTree();
	const onFocusChange = vi.fn<(id: string | null) => void>();

	const App = () => {
		const nav = createNavnode("app", verticalHandler);
		useOnFocusChange(nav(), onFocusChange);

		return (
			<nav.Context>
				<Item id="item1" />
				<Item id="item2" />
			</nav.Context>
		);
	};

	renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<App />
		</NavigationRoot>
	));

	expect(onFocusChange).toHaveBeenCalledTimes(1);
	expect(onFocusChange).toHaveBeenLastCalledWith("#/app/item1");

	await userEvent.keyboard("{ArrowDown}");
	expect(onFocusChange).toHaveBeenCalledTimes(2);
	expect(onFocusChange).toHaveBeenLastCalledWith("#/app/item2");
});

test("useOnFocus runs when focus is gained", async () => {
	const tree = createNavigationTree();
	const onFocus = vi.fn<() => void>();

	const App = () => {
		const nav = createNavnode("app", verticalHandler);
		useOnFocus(nav(), onFocus);

		return (
			<nav.Context>
				<Item id="item1" />
				<Item id="item2" />
			</nav.Context>
		);
	};

	renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<App />
		</NavigationRoot>
	));

	expect(onFocus).toHaveBeenCalledTimes(1);

	await userEvent.keyboard("{ArrowDown}");
	expect(onFocus).toHaveBeenCalledTimes(1);
});

test("useOnBlur runs when focus leaves scope", async () => {
	const tree = createNavigationTree();
	const onBlur = vi.fn<() => void>();

	const App = () => {
		const app = createNavnode("app", verticalHandler);
		useOnBlur(app(), onBlur);

		return (
			<app.Context>
				<Item id="item1" />
				<Item id="item2" />
			</app.Context>
		);
	};

	renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="root" handler={horizontalHandler}>
				<App />
				<Navnode id="sidebar" handler={verticalHandler}>
					<Item id="side1" />
				</Navnode>
			</Navnode>
		</NavigationRoot>
	));

	expect(onBlur).not.toHaveBeenCalled();

	await userEvent.keyboard("{ArrowDown}");
	expect(onBlur).not.toHaveBeenCalled();

	await userEvent.keyboard("{ArrowRight}");
	expect(tree.focus).toBe("#/root/sidebar/side1");
	expect(onBlur).toHaveBeenCalledTimes(1);
});

test("useFocus focuses nodes relative to parent", async () => {
	const tree = createNavigationTree();

	const App = () => {
		const nav = createNavnode("app", verticalHandler);

		return (
			<nav.Context>
				<Item id="item1" />
				<Item id="item2" />
				<FocusButton />
			</nav.Context>
		);
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<App />
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/app/item1");

	await getByText("focus item2").click();
	expect(tree.focus).toBe("#/app/item2");
});

test("useActivate activates nodes relative to parent", async () => {
	const tree = createNavigationTree();
	const onActivate = vi.fn<(id: string) => void>();

	const App = () => {
		const nav = createNavnode("app", verticalHandler);

		return (
			<nav.Context>
				<ActivatableItem id="item1" onActivate={onActivate} />
				<ActivatableItem id="item2" onActivate={onActivate} />
				<ActivateButton />
			</nav.Context>
		);
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<App />
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/app/item1");

	await getByText("activate item2").click();

	expect(onActivate).toHaveBeenCalledTimes(1);
	expect(onActivate).toHaveBeenCalledWith("item2");
	expect(tree.focus).toBe("#/app/item2");
});

function FocusIndicator(props: { scope: string }) {
	const focusedId = useFocusedId(props.scope);

	return <div data-testid="focused">{focusedId() ?? "none"}</div>;
}

function FocusButton() {
	const focus = useFocus();

	return <div onClick={() => focus("item2")}>focus item2</div>;
}

function ActivateButton() {
	const activate = useActivate();

	return <div onClick={() => activate("item2")}>activate item2</div>;
}

function Item(props: { id: string }) {
	const nav = createNavnode(props.id, itemHandler());

	return <div>{nav()}</div>;
}

function ActivatableItem(props: { id: string; onActivate: (id: string) => void }) {
	const nav = createNavnode(
		props.id,
		itemHandler(() => props.onActivate(props.id)),
	);

	return <div>{nav()}</div>;
}
